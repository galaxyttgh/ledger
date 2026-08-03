import express from 'express';
import pool from '../db/pool.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Temp storage for CSV uploads
const upload = multer({ dest: 'uploads/temp/' });

// Create bank_accounts table
const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      account_number VARCHAR(50),
      bank_name VARCHAR(255),
      current_balance DECIMAL(15,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bank_transactions (
      id SERIAL PRIMARY KEY,
      bank_account_id INTEGER REFERENCES bank_accounts(id),
      transaction_date DATE NOT NULL,
      description TEXT,
      reference VARCHAR(255),
      amount DECIMAL(15,2) NOT NULL,
      type VARCHAR(20) NOT NULL,
      matched_journal_id INTEGER REFERENCES journal_entries(id),
      status VARCHAR(20) DEFAULT 'unmatched',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Seed default bank account if none exists
  const existing = await pool.query('SELECT COUNT(*) FROM bank_accounts');
  if (parseInt(existing.rows[0].count) === 0) {
    await pool.query(
      "INSERT INTO bank_accounts (name, account_number, bank_name, current_balance) VALUES ($1, $2, $3, $4)",
      ['GTBank Operating Account', '0123456789', 'GTBank', 1097250]
    );
  }
};

ensureTable().catch(console.error);

// Get bank accounts
router.get('/accounts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bank_accounts WHERE is_active = true');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Import bank statement (CSV)
router.post('/import', upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { bank_account_id } = req.body;
    const filePath = req.file.path;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    let imported = 0;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 4) {
          const date = cols[0].trim();
          const description = cols[1].trim();
          const reference = cols[2]?.trim() || '';
          const amount = parseFloat(cols[3].trim());
          const type = amount >= 0 ? 'credit' : 'deposit';
          // Normalize: deposits are positive, withdrawals negative
          const normalizedAmount = cols.length >= 5 && cols[4].trim().toLowerCase() === 'withdrawal' 
            ? -Math.abs(amount) 
            : amount;

          await client.query(
            `INSERT INTO bank_transactions (bank_account_id, transaction_date, description, reference, amount, type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [bank_account_id, date, description, reference, normalizedAmount, type]
          );
          imported++;
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // Clean up temp file
    fs.unlinkSync(filePath);

    res.json({ message: `Imported ${imported} transactions`, imported });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed' });
  }
});

// Get bank transactions with match status
router.get('/transactions', async (req, res) => {
  try {
    const { bank_account_id, status } = req.query;
    let query = `
      SELECT bt.*, ba.name as account_name, je.entry_number
      FROM bank_transactions bt
      JOIN bank_accounts ba ON bt.bank_account_id = ba.id
      LEFT JOIN journal_entries je ON bt.matched_journal_id = je.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (bank_account_id) {
      params.push(bank_account_id);
      query += ` AND bt.bank_account_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND bt.status = $${params.length}`;
    }

    query += ' ORDER BY bt.transaction_date DESC, bt.id DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Match a bank transaction to a journal entry
router.post('/match', async (req, res) => {
  try {
    const { bank_transaction_id, journal_entry_id } = req.body;

    await pool.query(
      `UPDATE bank_transactions SET matched_journal_id = $1, status = 'matched' WHERE id = $2`,
      [journal_entry_id, bank_transaction_id]
    );

    res.json({ message: 'Transaction matched successfully' });

  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ error: 'Match failed' });
  }
});

// Get reconciliation summary
router.get('/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ba.id,
        ba.name,
        ba.current_balance as ledger_balance,
        COUNT(bt.id) as total_transactions,
        COUNT(CASE WHEN bt.status = 'matched' THEN 1 END) as matched,
        COUNT(CASE WHEN bt.status = 'unmatched' THEN 1 END) as unmatched,
        COALESCE(SUM(CASE WHEN bt.status = 'unmatched' THEN bt.amount ELSE 0 END), 0) as unmatched_amount
      FROM bank_accounts ba
      LEFT JOIN bank_transactions bt ON ba.id = bt.bank_account_id
      GROUP BY ba.id, ba.name, ba.current_balance
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auto-match bank transactions to journal entries
// router.post('/auto-match', async (req, res) => {
//   try {
//     const { bank_account_id } = req.body;

//     // Get unmatched bank transactions
//     const unmatched = await pool.query(
//       `SELECT * FROM bank_transactions WHERE bank_account_id = $1 AND status = 'unmatched'`,
//       [bank_account_id]
//     );

//     let matched = 0;

//     for (const txn of unmatched.rows) {
//       // Try exact amount match
//       const matches = await pool.query(`
//         SELECT je.id, je.entry_number, 
//                ABS(COALESCE(SUM(jl.debit), 0) - $1) as amount_diff
//         FROM journal_entries je
//         JOIN journal_lines jl ON je.id = jl.journal_entry_id
//         WHERE je.status = 'posted'
//         GROUP BY je.id, je.entry_number
//         HAVING ABS(COALESCE(SUM(jl.debit), 0) - $1) < 0.01
//         LIMIT 1
//       `, [Math.abs(txn.amount)]);

//       if (matches.rows.length > 0) {
//         // Auto-match
//         await pool.query(
//           `UPDATE bank_transactions SET matched_journal_id = $1, status = 'matched' WHERE id = $2`,
//           [matches.rows[0].id, txn.id]
//         );
//         matched++;
//       }
//     }

//     res.json({ 
//       message: `Auto-matched ${matched} of ${unmatched.rows.length} transactions`,
//       matched,
//       total: unmatched.rows.length 
//     });

//   } catch (error) {
//     console.error('Auto-match error:', error);
//     res.status(500).json({ error: 'Auto-match failed' });
//   }
// });
// Auto-match bank transactions with fuzzy logic
router.post('/auto-match', async (req, res) => {
  try {
    const { bank_account_id, tolerance = 100 } = req.body;

    const unmatched = await pool.query(
      `SELECT * FROM bank_transactions WHERE bank_account_id = $1 AND status = 'unmatched'`,
      [bank_account_id]
    );

    let matched = 0;

    for (const txn of unmatched.rows) {
      const txnAmount = Math.abs(txn.amount);
      
      // Try exact match first
      let match = await pool.query(`
        SELECT je.id, je.entry_number,
               ABS(COALESCE(SUM(CASE WHEN jl.debit > 0 THEN jl.debit ELSE jl.credit END), 0) - $1) as amount_diff
        FROM journal_entries je
        JOIN journal_lines jl ON je.id = jl.journal_entry_id
        WHERE je.status = 'posted'
          AND je.id NOT IN (SELECT matched_journal_id FROM bank_transactions WHERE matched_journal_id IS NOT NULL)
        GROUP BY je.id, je.entry_number
        HAVING ABS(COALESCE(SUM(CASE WHEN jl.debit > 0 THEN jl.debit ELSE jl.credit END), 0) - $1) <= $2
        ORDER BY amount_diff ASC
        LIMIT 1
      `, [txnAmount, tolerance]);

      // If no amount match, try fuzzy reference match
      if (match.rows.length === 0 && txn.reference) {
        match = await pool.query(`
          SELECT je.id, je.entry_number, 0 as amount_diff
          FROM journal_entries je
          WHERE je.status = 'posted'
            AND je.description ILIKE $1
            AND je.id NOT IN (SELECT matched_journal_id FROM bank_transactions WHERE matched_journal_id IS NOT NULL)
          LIMIT 1
        `, [`%${txn.reference}%`]);
      }

      // If still no match, try date proximity (±2 days)
      if (match.rows.length === 0) {
        match = await pool.query(`
          SELECT je.id, je.entry_number,
                 ABS(COALESCE(SUM(CASE WHEN jl.debit > 0 THEN jl.debit ELSE jl.credit END), 0) - $1) as amount_diff
          FROM journal_entries je
          JOIN journal_lines jl ON je.id = jl.journal_entry_id
          WHERE je.status = 'posted'
            AND je.entry_date BETWEEN $2::date - 2 AND $2::date + 2
            AND je.id NOT IN (SELECT matched_journal_id FROM bank_transactions WHERE matched_journal_id IS NOT NULL)
          GROUP BY je.id, je.entry_number
          HAVING ABS(COALESCE(SUM(CASE WHEN jl.debit > 0 THEN jl.debit ELSE jl.credit END), 0) - $1) <= $3
          ORDER BY amount_diff ASC
          LIMIT 1
        `, [txnAmount, txn.transaction_date, tolerance * 5]);
      }

      if (match.rows.length > 0) {
        await pool.query(
          `UPDATE bank_transactions SET matched_journal_id = $1, status = 'matched' WHERE id = $2`,
          [match.rows[0].id, txn.id]
        );
        matched++;
      }
    }

    res.json({ 
      message: `Auto-matched ${matched} of ${unmatched.rows.length} transactions`,
      matched,
      total: unmatched.rows.length 
    });

  } catch (error) {
    console.error('Auto-match error:', error);
    res.status(500).json({ error: 'Auto-match failed' });
  }
});

// Get exception queue (unmatched after auto-match)
router.get('/exceptions', async (req, res) => {
  try {
    const { bank_account_id } = req.query;
    const result = await pool.query(
      `SELECT * FROM bank_transactions WHERE bank_account_id = $1 AND status = 'unmatched' ORDER BY transaction_date DESC`,
      [bank_account_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Certify reconciliation
router.post('/certify', async (req, res) => {
  try {
    const { bank_account_id } = req.body;
    
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'CERTIFY_RECONCILIATION', 'bank_accounts', $2, $3)`,
      [1, bank_account_id, JSON.stringify({ certified_at: new Date().toISOString() })]
    );

    res.json({ message: 'Reconciliation certified' });

  } catch (error) {
    res.status(500).json({ error: 'Certification failed' });
  }
});

export default router;