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
import quotationRoutes from './routes/quotations.js';
import collectionRoutes from './routes/collections.js';
import poRoutes from './routes/purchaseOrders.js';
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
app.use('/api/quotations', quotationRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/purchase-orders', poRoutes);
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
app.get('/api/reports/balance-sheet', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.type, a.code, a.name,
        COALESCE(SUM(jl.debit), 0) as total_debit,
        COALESCE(SUM(jl.credit), 0) as total_credit,
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
      HAVING COALESCE(SUM(jl.debit), 0) + COALESCE(SUM(jl.credit), 0) > 0
      ORDER BY a.code
    `);

    const assets = result.rows
      .filter(r => r.type === 'asset' && Number(r.balance) !== 0)
      .map(r => ({ code: r.code, name: r.name, amount: Number(r.balance) }));

    const liabilities = result.rows
      .filter(r => r.type === 'liability' && Number(r.balance) !== 0)
      .map(r => ({ code: r.code, name: r.name, amount: Number(r.balance) }));

    const totalRevenue = result.rows
      .filter(r => r.type === 'revenue')
      .reduce((sum, r) => sum + Number(r.balance), 0);
    
    const totalExpenses = result.rows
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + Number(r.balance), 0);
    
    const netIncome = totalRevenue - totalExpenses;

    const equity = result.rows
      .filter(r => r.type === 'equity' && Number(r.balance) !== 0)
      .map(r => ({ code: r.code, name: r.name, amount: Number(r.balance) }));

    if (netIncome !== 0) {
      equity.push({ code: 'NET', name: 'Current Period Net Income', amount: netIncome });
    }

    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      assets, totalAssets,
      liabilities, totalLiabilities,
      equity, totalEquity,
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
// app.get('/api/reports/cash-flow', async (req, res) => {
//   try {
//     // Operating: Receipts from customers
//     const receipts = await pool.query(`
//       SELECT COALESCE(SUM(amount), 0) as total FROM receipts
//     `);

//     // Operating: Payments to suppliers
//     const payments = await pool.query(`
//       SELECT COALESCE(SUM(amount), 0) as total FROM payments
//     `);

//     // Get all bank-related journal lines for cash movements
//     const bankMoves = await pool.query(`
//       SELECT 
//         CASE WHEN jl.debit > 0 THEN 'inflow' ELSE 'outflow' END as direction,
//         CASE WHEN jl.debit > 0 THEN jl.debit ELSE jl.credit END as amount,
//         je.description
//       FROM journal_lines jl
//       JOIN journal_entries je ON jl.journal_entry_id = je.id
//       JOIN accounts a ON jl.account_id = a.id
//       WHERE a.code LIKE '1102%' AND je.status = 'posted'
//     `);

//     const operatingInflow = parseFloat(receipts.rows[0].total) || 0;
//     const operatingOutflow = parseFloat(payments.rows[0].total) || 0;
//     const netOperating = operatingInflow - operatingOutflow;

//     // Opening balance (from initial journal)
//     const openingBalance = 500000;

//     res.json({
//       operatingActivities: [
//         { name: 'Receipts from Customers', amount: operatingInflow },
//         { name: 'Payments to Suppliers', amount: -operatingOutflow },
//       ],
//       netOperating,
//       openingBalance,
//       closingBalance: openingBalance + netOperating,
//     });
//   } catch (error) {
//     console.error('Cash flow error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
app.get('/api/reports/cash-flow', async (req, res) => {
  try {
    const receipts = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total FROM receipts
    `);

    const payments = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments
    `);

    const operatingInflow = parseFloat(receipts.rows[0].total) || 0;
    const operatingOutflow = parseFloat(payments.rows[0].total) || 0;
    const netOperating = operatingInflow - operatingOutflow;

    // Get actual bank balance from opening entry
    const openingResult = await pool.query(`
      SELECT COALESCE(SUM(jl.debit) - SUM(jl.credit), 0) as balance
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      JOIN accounts a ON jl.account_id = a.id
      WHERE a.code = '1102' AND je.status = 'posted' AND je.description ILIKE '%opening%'
    `);

    // Get current bank balance
    const currentResult = await pool.query(`
      SELECT COALESCE(SUM(jl.debit) - SUM(jl.credit), 0) as balance
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      JOIN accounts a ON jl.account_id = a.id
      WHERE a.code = '1102' AND je.status = 'posted'
    `);

    const openingBalance = parseFloat(openingResult.rows[0].balance) || 0;
    const closingBalance = parseFloat(currentResult.rows[0].balance) || 0;

    res.json({
      operatingActivities: [
        { name: 'Receipts from Customers', amount: operatingInflow },
        { name: 'Payments to Suppliers', amount: -operatingOutflow },
      ],
      netOperating,
      openingBalance,
      closingBalance,
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

// VAT Return Schedule
app.get('/api/reports/vat-schedule', async (req, res) => {
  try {
    // VAT Collected (Output VAT) - from invoices
    const outputVAT = await pool.query(`
      SELECT COALESCE(SUM(tax_amount), 0) as total
      FROM invoices
      WHERE status IN ('posted', 'paid')
    `);

    // VAT Paid (Input VAT) - from bills
    const inputVAT = await pool.query(`
      SELECT COALESCE(SUM(tax_amount), 0) as total
      FROM bills
      WHERE status IN ('posted', 'paid')
    `);

    // VAT on credit notes (refunds reduce output VAT)
    const creditNoteVAT = await pool.query(`
      SELECT COALESCE(SUM(ABS(tax_amount)), 0) as total
      FROM invoices
      WHERE status = 'credit_note'
    `);

    // VAT on debit notes (refunds reduce input VAT)
    const debitNoteVAT = await pool.query(`
      SELECT COALESCE(SUM(ABS(tax_amount)), 0) as total
      FROM bills
      WHERE status = 'debit_note'
    `);

    const totalOutputVAT = parseFloat(outputVAT.rows[0].total) - parseFloat(creditNoteVAT.rows[0].total);
    const totalInputVAT = parseFloat(inputVAT.rows[0].total) - parseFloat(debitNoteVAT.rows[0].total);
    const netVATPayable = totalOutputVAT - totalInputVAT;

    // Get transaction details
    const outputDetails = await pool.query(`
      SELECT invoice_number, invoice_date, customer_id, subtotal, tax_amount, total, status
      FROM invoices WHERE status IN ('posted', 'paid', 'credit_note')
      ORDER BY invoice_date
    `);

    const inputDetails = await pool.query(`
      SELECT bill_number, bill_date, supplier_id, subtotal, tax_amount, total, status
      FROM bills WHERE status IN ('posted', 'paid', 'debit_note')
      ORDER BY bill_date
    `);

    res.json({
      outputVAT: totalOutputVAT,
      inputVAT: totalInputVAT,
      netVATPayable,
      outputDetails: outputDetails.rows,
      inputDetails: inputDetails.rows,
    });
  } catch (error) {
    console.error('VAT schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// WHT Certificate
app.get('/api/reports/wht-certificates', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id, s.name as supplier_name, s.tax_id,
        b.id as bill_id, b.bill_number, b.bill_date, b.subtotal, b.tax_amount, b.total,
        COALESCE(SUM(p.amount), 0) as paid_amount
      FROM bills b
      JOIN suppliers s ON b.supplier_id = s.id
      LEFT JOIN payments p ON b.id = p.bill_id
      WHERE b.status IN ('posted', 'paid')
      GROUP BY s.id, s.name, s.tax_id, b.id, b.bill_number, b.bill_date, b.subtotal, b.tax_amount, b.total
      HAVING b.total > 0
    `);

    // const certificates = result.rows.map(row => ({
    //   ...row,
    //   wht_rate: 5, // 5% WHT
    //   wht_amount: parseFloat(row.subtotal) * 0.05,
    //  net_payment: parseFloat(row.total) - wht_amount,
    // }));
const certificates = result.rows.map(row => {
  const whtAmount = parseFloat(row.subtotal) * 0.05;
  return {
    ...row,
    wht_rate: 5,
    wht_amount: whtAmount,
    net_payment: parseFloat(row.total) - whtAmount,
  };
});
    res.json(certificates);
  } catch (error) {
    console.error('WHT error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Tax Rates
// app.get('/api/tax-rates', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM tax_rates WHERE is_active = true ORDER BY name');
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// app.put('/api/tax-rates/:id', async (req, res) => {
//   try {
//     const { rate } = req.body;
//     await pool.query('UPDATE tax_rates SET rate = $1 WHERE id = $2', [rate, req.params.id]);
//     res.json({ message: 'Tax rate updated' });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Tax Rates
app.get('/api/tax-rates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tax_codes WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/tax-rates/:id', async (req, res) => {
  try {
    const { rate } = req.body;
    await pool.query('UPDATE tax_codes SET rate = $1 WHERE id = $2', [rate, req.params.id]);
    res.json({ message: 'Tax rate updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Customer Statement
app.get('/api/reports/customer-statement/:id', async (req, res) => {
  try {
    const customer = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (customer.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const invoices = await pool.query(`
      SELECT invoice_number, invoice_date, due_date, total, status, 'invoice' as type
      FROM invoices WHERE customer_id = $1
      UNION ALL
      SELECT receipt_number, payment_date, null, amount, 'receipt' as type, 'receipt'
      FROM receipts WHERE customer_id = $1
      ORDER BY invoice_date
    `, [req.params.id]);

    res.json({
      customer: customer.rows[0],
      transactions: invoices.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Supplier Statement
app.get('/api/reports/supplier-statement/:id', async (req, res) => {
  try {
    const supplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
    if (supplier.rows.length === 0) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    const bills = await pool.query(`
      SELECT bill_number, bill_date, due_date, total, status, 'bill' as type
      FROM bills WHERE supplier_id = $1
      UNION ALL
      SELECT payment_number, payment_date, null, amount, 'payment' as type, 'payment'
      FROM payments WHERE supplier_id = $1
      ORDER BY bill_date
    `, [req.params.id]);

    res.json({
      supplier: supplier.rows[0],
      transactions: bills.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Payment Batch
app.post('/api/payments/batch', async (req, res) => {
  const client = await pool.connect();
  try {
    const { supplier_id, bill_ids, payment_date } = req.body;
    const userId = (req as any).userId || 1;

    await client.query('BEGIN');

    for (const billId of bill_ids) {
      const bill = await client.query('SELECT * FROM bills WHERE id = $1', [billId]);
      if (bill.rows.length === 0) continue;

      const amount = parseFloat(bill.rows[0].total);
      const paymentNumber = `PAY-${Date.now()}-${billId}`;

      await client.query(
        `INSERT INTO payments (payment_number, supplier_id, bill_id, amount, payment_date, payment_method)
         VALUES ($1, $2, $3, $4, $5, 'bank_transfer')`,
        [paymentNumber, supplier_id, billId, amount, payment_date]
      );

      // Journal entry
      const entryNumber = `JV-${Date.now()}-${billId}`;
      const journal = await client.query(
        `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
         VALUES ($1, $2, $3, 'JUL-2026', 'posted', $4) RETURNING id`,
        [entryNumber, `Batch payment ${paymentNumber}`, payment_date, userId]
      );

      await client.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 11, $2, $3, 0)',
        [journal.rows[0].id, 'AP Payment', amount]
      );
      await client.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 4, $2, 0, $3)',
        [journal.rows[0].id, 'Bank Payment', amount]
      );

      await client.query('UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2', [amount, supplier_id]);
      await client.query("UPDATE bills SET status = 'paid' WHERE id = $1", [billId]);
    }

    await client.query('COMMIT');
    res.json({ message: `Batch payment processed for ${bill_ids.length} bills` });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Dashboard financial summary
app.get('/api/dashboard/financial-summary', async (req, res) => {
  try {
    const revenue = await pool.query(`
      SELECT COALESCE(SUM(jl.credit) - SUM(jl.debit), 0) as total
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      JOIN accounts a ON jl.account_id = a.id
      WHERE a.type = 'revenue' AND je.status = 'posted'
    `);

    const expenses = await pool.query(`
      SELECT COALESCE(SUM(jl.debit) - SUM(jl.credit), 0) as total
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      JOIN accounts a ON jl.account_id = a.id
      WHERE a.type = 'expense' AND je.status = 'posted'
    `);

    const cashBalance = await pool.query(`
      SELECT COALESCE(SUM(jl.debit) - SUM(jl.credit), 0) as total
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      JOIN accounts a ON jl.account_id = a.id
      WHERE a.code LIKE '1102%' AND je.status = 'posted'
    `);

    const payables = await pool.query(`
      SELECT COALESCE(SUM(jl.credit) - SUM(jl.debit), 0) as total
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      JOIN accounts a ON jl.account_id = a.id
      WHERE a.code LIKE '2101%' AND je.status = 'posted'
    `);

    const receivables = await pool.query(`
      SELECT COALESCE(SUM(jl.debit) - SUM(jl.credit), 0) as total
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      JOIN accounts a ON jl.account_id = a.id
      WHERE a.code LIKE '1103%' AND je.status = 'posted'
    `);

    res.json({
      revenue: Math.abs(parseFloat(revenue.rows[0].total) || 0),
      expenses: Math.abs(parseFloat(expenses.rows[0].total) || 0),
      cashBalance: parseFloat(cashBalance.rows[0].total) || 0,
      payables: Math.abs(parseFloat(payables.rows[0].total) || 0),
      receivables: Math.abs(parseFloat(receivables.rows[0].total) || 0),
      netProfit: Math.abs(parseFloat(revenue.rows[0].total) || 0) - Math.abs(parseFloat(expenses.rows[0].total) || 0),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});