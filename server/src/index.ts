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
import pool from './db/pool.js';

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});