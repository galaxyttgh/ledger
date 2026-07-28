import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import createTables from './db/schema.js';
import authRoutes from './routes/auth.js';
import accountsRoutes from './routes/accounts.js';
import seedAccounts from './db/seed.js';
import journalRoutes from './routes/journals.js';
import customerRoutes from './routes/customers.js';
import invoiceRoutes from './routes/invoices.js';
import supplierRoutes from './routes/suppliers.js';
import billRoutes from './routes/bills.js';
import receiptRoutes from './routes/receipts.js';
import paymentRoutes from './routes/payments.js';
import documentRoutes from './routes/documents.js';
import bankingRoutes from './routes/banking.js';
import approvalRoutes from './routes/approvals.js';
import branchRoutes from './routes/branches.js';
import payrollRoutes from './routes/payroll.js';
import pool from './db/pool.js';
import { authMiddleware } from './middleware/auth.js';
import budgetRoutes from './routes/budgets.js';
import assetRoutes from './routes/assets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
createTables()
  .then(() => seedAccounts())
  .then(() => console.log('Database initialized and seeded'))
  .catch(err => console.error('Database init failed:', err));


  app.use('/uploads', express.static('uploads'));
  app.use(authMiddleware);
// Routes

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/assets', assetRoutes);
// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrimeLedger API is running' });
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [customers, suppliers, invoices, bills, journals] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM customers'),
      pool.query('SELECT COUNT(*) FROM suppliers'),
      pool.query('SELECT COUNT(*) FROM invoices'),
      pool.query('SELECT COUNT(*) FROM bills'),
      pool.query('SELECT COUNT(*) FROM journal_entries WHERE status = $1', ['posted']),
    ]);

    res.json({
      customers: parseInt(customers.rows[0].count),
      suppliers: parseInt(suppliers.rows[0].count),
      invoices: parseInt(invoices.rows[0].count),
      bills: parseInt(bills.rows[0].count),
      journals: parseInt(journals.rows[0].count),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Income Statement (Profit & Loss)
app.get('/api/reports/income-statement', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.type,
        a.code,
        a.name,
        COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0) as balance
      FROM accounts a
      LEFT JOIN journal_lines jl ON a.id = jl.account_id
      LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id AND je.status = 'posted'
      WHERE a.type IN ('revenue', 'expense')
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `);

    const revenue = result.rows
      .filter(r => r.type === 'revenue')
      .map(r => ({ code: r.code, name: r.name, amount: Number(r.balance) }));

    const expenses = result.rows
      .filter(r => r.type === 'expense')
      .map(r => ({ code: r.code, name: r.name, amount: Math.abs(Number(r.balance)) }));

    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    res.json({
      revenue,
      totalRevenue,
      expenses,
      totalExpenses,
      netIncome,
    });

  } catch (error) {
    console.error('Income statement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Balance Sheet
// Balance Sheet
app.get('/api/reports/balance-sheet', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.type,
        a.code,
        a.name,
        CASE 
          WHEN a.type IN ('asset', 'expense') THEN
            COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)
          ELSE
            COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
        END as balance
      FROM accounts a
      LEFT JOIN journal_lines jl ON a.id = jl.account_id
      LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id AND je.status = 'posted'
      WHERE a.type IN ('asset', 'liability', 'equity', 'revenue', 'expense')
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `);

    const assets = result.rows
      .filter(r => r.type === 'asset')
      .map(r => ({ code: r.code, name: r.name, amount: Number(r.balance) }))
      .filter(r => r.amount !== 0);

    const liabilities = result.rows
      .filter(r => r.type === 'liability')
      .map(r => ({ code: r.code, name: r.name, amount: Math.abs(Number(r.balance)) }))
      .filter(r => r.amount !== 0);

    // Calculate net income (Revenue - Expenses)
    const totalRevenue = result.rows
      .filter(r => r.type === 'revenue')
      .reduce((sum, r) => sum + Math.abs(Number(r.balance)), 0);
    
    const totalExpenses = result.rows
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + Number(r.balance), 0);
    
    const netIncome = totalRevenue - totalExpenses;

    const equity = result.rows
      .filter(r => r.type === 'equity')
      .map(r => ({ code: r.code, name: r.name, amount: Math.abs(Number(r.balance)) }));

    // Add net income to equity
    if (netIncome !== 0) {
      equity.push({
        code: 'NET',
        name: 'Current Period Net Income',
        amount: netIncome,
      });
    }

    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      assets,
      totalAssets,
      liabilities,
      totalLiabilities,
      equity,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      netIncome,
    });

  } catch (error) {
    console.error('Balance sheet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Audit Trail search
app.get('/api/audit-log', async (req, res) => {
  try {
    const { user, action, table_name, limit } = req.query;
    let query = `
      SELECT al.*, u.full_name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (user) {
      paramCount++;
      params.push(`%${user}%`);
      query += ` AND u.full_name ILIKE $${paramCount}`;
    }
    if (action) {
      paramCount++;
      params.push(action);
      query += ` AND al.action = $${paramCount}`;
    }
    if (table_name) {
      paramCount++;
      params.push(table_name);
      query += ` AND al.table_name = $${paramCount}`;
    }

    query += ` ORDER BY al.created_at DESC LIMIT ${limit || 100}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// AR Aging Report
app.get('/api/reports/ar-aging', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.code, c.name,
        i.id as invoice_id, i.invoice_number, i.total, i.invoice_date, i.due_date, i.status,
        COALESCE(SUM(r.amount), 0) as paid_amount,
        i.total - COALESCE(SUM(r.amount), 0) as balance,
        CURRENT_DATE - i.due_date as days_overdue
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      LEFT JOIN receipts r ON i.id = r.invoice_id
      WHERE i.status != 'paid'
      GROUP BY c.id, c.code, c.name, i.id, i.invoice_number, i.total, i.invoice_date, i.due_date, i.status
      HAVING i.total - COALESCE(SUM(r.amount), 0) > 0
      ORDER BY days_overdue DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('AR aging error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// AP Aging Report
app.get('/api/reports/ap-aging', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id, s.code, s.name,
        b.id as bill_id, b.bill_number, b.total, b.bill_date, b.due_date, b.status,
        COALESCE(SUM(p.amount), 0) as paid_amount,
        b.total - COALESCE(SUM(p.amount), 0) as balance,
        CURRENT_DATE - b.due_date as days_overdue
      FROM bills b
      JOIN suppliers s ON b.supplier_id = s.id
      LEFT JOIN payments p ON b.id = p.bill_id
      WHERE b.status != 'paid'
      GROUP BY s.id, s.code, s.name, b.id, b.bill_number, b.total, b.bill_date, b.due_date, b.status
      HAVING b.total - COALESCE(SUM(p.amount), 0) > 0
      ORDER BY days_overdue DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('AP aging error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Dashboard alerts
app.get('/api/dashboard/alerts', async (req, res) => {
  try {
    // Overdue invoices
    const overdueInvoices = await pool.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(i.total - COALESCE(r.paid, 0)), 0) as total
      FROM invoices i
      LEFT JOIN (SELECT invoice_id, SUM(amount) as paid FROM receipts GROUP BY invoice_id) r ON i.id = r.invoice_id
      WHERE i.status != 'paid' AND i.due_date < CURRENT_DATE
    `);

    // Overdue bills
    const overdueBills = await pool.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(b.total - COALESCE(p.paid, 0)), 0) as total
      FROM bills b
      LEFT JOIN (SELECT bill_id, SUM(amount) as paid FROM payments GROUP BY bill_id) p ON b.id = p.bill_id
      WHERE b.status != 'paid' AND b.due_date < CURRENT_DATE
    `);

    // Pending approvals
    const pendingApprovals = await pool.query(
      "SELECT COUNT(*) as count FROM approvals WHERE status = 'pending'"
    );

    // Unmatched bank transactions
    const unmatched = await pool.query(
      "SELECT COUNT(*) as count FROM bank_transactions WHERE status = 'unmatched'"
    );

    res.json({
      overdueInvoices: parseInt(overdueInvoices.rows[0].count),
      overdueInvoicesAmount: parseFloat(overdueInvoices.rows[0].total) || 0,
      overdueBills: parseInt(overdueBills.rows[0].count),
      overdueBillsAmount: parseFloat(overdueBills.rows[0].total) || 0,
      pendingApprovals: parseInt(pendingApprovals.rows[0].count),
      unmatchedTransactions: parseInt(unmatched.rows[0].count),
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cash Flow Statement
app.get('/api/reports/cash-flow', async (req, res) => {
  try {
    // Operating: Receipts from customers
    const receipts = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total FROM receipts
    `);

    // Operating: Payments to suppliers
    const payments = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments
    `);

    // Get all bank-related journal lines for cash movements
    const bankMoves = await pool.query(`
      SELECT 
        CASE WHEN jl.debit > 0 THEN 'inflow' ELSE 'outflow' END as direction,
        CASE WHEN jl.debit > 0 THEN jl.debit ELSE jl.credit END as amount,
        je.description
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      JOIN accounts a ON jl.account_id = a.id
      WHERE a.code LIKE '1102%' AND je.status = 'posted'
    `);

    const operatingInflow = parseFloat(receipts.rows[0].total) || 0;
    const operatingOutflow = parseFloat(payments.rows[0].total) || 0;
    const netOperating = operatingInflow - operatingOutflow;

    // Opening balance (from initial journal)
    const openingBalance = 500000;

    res.json({
      operatingActivities: [
        { name: 'Receipts from Customers', amount: operatingInflow },
        { name: 'Payments to Suppliers', amount: -operatingOutflow },
      ],
      netOperating,
      openingBalance,
      closingBalance: openingBalance + netOperating,
    });
  } catch (error) {
    console.error('Cash flow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Period Close
app.post('/api/periods/close', async (req, res) => {
  try {
    const { period } = req.body;
    const userId = (req as any).userId || 1;

    await pool.query(
      'INSERT INTO closed_periods (period, closed_by) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [period, userId]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, new_values)
       VALUES ($1, 'PERIOD_CLOSE', 'periods', $2)`,
      [userId, JSON.stringify({ period, status: 'closed' })]
    );

    res.json({ message: `Period ${period} closed successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Check if period is closed
app.get('/api/periods/check/:period', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM closed_periods WHERE period = $1', [req.params.period]);
    res.json({ closed: result.rows.length > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get closed periods
app.get('/api/periods', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cp.*, u.full_name as closed_by_name
      FROM closed_periods cp
      LEFT JOIN users u ON cp.closed_by = u.id
      ORDER BY cp.period DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reopen period
app.post('/api/periods/reopen', async (req, res) => {
  try {
    const { period } = req.body;
    await pool.query('DELETE FROM closed_periods WHERE period = $1', [period]);
    res.json({ message: `Period ${period} reopened` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});