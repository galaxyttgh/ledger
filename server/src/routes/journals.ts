import express from 'express';
import pool from '../db/pool.js';
import { z } from 'zod';


const journalSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  entry_date: z.string().min(1, 'Date is required'),
  period: z.string().min(1, 'Period is required'),
  branch_id: z.number().optional().nullable(),
  lines: z.array(z.object({
    account_id: z.number().min(1, 'Account is required'),
    description: z.string().optional(),
    debit: z.number().min(0),
    credit: z.number().min(0),
  })).min(2, 'At least 2 lines required'),
});

const router = express.Router();

// Middleware to verify JWT (simplified - we'll enhance later)
const authMiddleware = (req: any, res: any, next: any) => {
  // We'll skip strict auth for now while testing
  // In production, verify the JWT token here
  next();
};

// Get all journal entries
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT je.*, u.full_name as created_by_name
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      ORDER BY je.entry_date DESC, je.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single journal entry with lines
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await pool.query(
      'SELECT * FROM journal_entries WHERE id = $1',
      [req.params.id]
    );
    
    if (entry.rows.length === 0) {
      res.status(404).json({ error: 'Journal entry not found' });
      return;
    }

    const lines = await pool.query(`
      SELECT jl.*, a.code as account_code, a.name as account_name
      FROM journal_lines jl
      JOIN accounts a ON jl.account_id = a.id
      WHERE jl.journal_entry_id = $1
    `, [req.params.id]);

    res.json({
      ...entry.rows[0],
      lines: lines.rows
    });

  } catch (error) {
    console.error('Get journal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create journal entry with double-entry validation
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Validate input
    const validation = journalSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
      return;
    }

    const { description, entry_date, period, branch_id, lines } = req.body;

    // Validate lines exist
    if (!lines || lines.length < 2) {
      res.status(400).json({ error: 'Journal entry must have at least 2 lines' });
      return;
    }

    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      totalDebit += parseFloat(line.debit) || 0;
      totalCredit += parseFloat(line.credit) || 0;
    }

    // Double-entry validation
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      res.status(400).json({ 
        error: 'Journal entry is not balanced',
        total_debit: totalDebit,
        total_credit: totalCredit,
        difference: totalDebit - totalCredit
      });
      return;
    }

    await client.query('BEGIN');

    // Generate entry number
    const entryNumber = `JV-${Date.now()}`;

    // Create journal entry
    const entry = await client.query(`
      INSERT INTO journal_entries (entry_number, description, entry_date, period, branch_id, status, created_by)
      VALUES ($1, $2, $3, $4, $5, 'posted', 1)
      RETURNING *
    `, [entryNumber, description, entry_date, period, branch_id || null]);

    // Create journal lines
    const createdLines = [];
    for (const line of lines) {
      const result = await client.query(`
        INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [entry.rows[0].id, line.account_id, line.description, line.debit || 0, line.credit || 0]);
      createdLines.push(result.rows[0]);
    }

    // Audit log
    await client.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, $2, $3, $4, $5)
    `, [1, 'CREATE', 'journal_entries', entry.rows[0].id, 
        JSON.stringify({ entry_number: entryNumber, description, total_debit: totalDebit, total_credit: totalCredit })]);

    await client.query('COMMIT');

    res.status(201).json({
      ...entry.rows[0],
      lines: createdLines
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create journal error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Trial Balance
router.get('/reports/trial-balance', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.code,
        a.name,
        a.type,
        COALESCE(SUM(jl.debit), 0) as total_debit,
        COALESCE(SUM(jl.credit), 0) as total_credit,
        CASE 
          WHEN COALESCE(SUM(jl.debit), 0) >= COALESCE(SUM(jl.credit), 0) 
          THEN COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)
          ELSE 0
        END as debit_balance,
        CASE 
          WHEN COALESCE(SUM(jl.credit), 0) > COALESCE(SUM(jl.debit), 0) 
          THEN COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
          ELSE 0
        END as credit_balance
      FROM accounts a
      LEFT JOIN journal_lines jl ON a.id = jl.account_id
      LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id
      WHERE je.status = 'posted' OR je.status IS NULL
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `);

    const totals = result.rows.reduce(
      (acc, row) => ({
        total_debit: acc.total_debit + Number(row.total_debit),
        total_credit: acc.total_credit + Number(row.total_credit),
        debit_balance: acc.debit_balance + Number(row.debit_balance),
        credit_balance: acc.credit_balance + Number(row.credit_balance),
      }),
      { total_debit: 0, total_credit: 0, debit_balance: 0, credit_balance: 0 }
    );

    res.json({
      accounts: result.rows.filter(row => Number(row.total_debit) > 0 || Number(row.total_credit) > 0),
      totals
    });

  } catch (error) {
    console.error('Trial balance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;