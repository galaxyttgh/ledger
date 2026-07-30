// import express from 'express';
// import pool from '../db/pool.js';
// import { z } from 'zod';
// import { periodGuard } from '../middleware/period.js';

// const journalSchema = z.object({
//   description: z.string().min(1, 'Description is required'),
//   entry_date: z.string().min(1, 'Date is required'),
//   period: z.string().min(1, 'Period is required'),
//   branch_id: z.number().optional().nullable(),
//   lines: z.array(z.object({
//     account_id: z.number().min(1, 'Account is required'),
//     description: z.string().optional(),
//     debit: z.number().min(0),
//     credit: z.number().min(0),
//   })).min(2, 'At least 2 lines required'),
// });

// const router = express.Router();

// // Middleware to verify JWT (simplified - we'll enhance later)
// const authMiddleware = (req: any, res: any, next: any) => {
//   // We'll skip strict auth for now while testing
//   // In production, verify the JWT token here
//   next();
// };

// // Get all journal entries
// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT je.*, u.full_name as created_by_name
//       FROM journal_entries je
//       LEFT JOIN users u ON je.created_by = u.id
//       ORDER BY je.entry_date DESC, je.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get journals error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get single journal entry with lines
// router.get('/:id', authMiddleware, async (req, res) => {
//   try {
//     const entry = await pool.query(
//       'SELECT * FROM journal_entries WHERE id = $1',
//       [req.params.id]
//     );
    
//     if (entry.rows.length === 0) {
//       res.status(404).json({ error: 'Journal entry not found' });
//       return;
//     }

//     const lines = await pool.query(`
//       SELECT jl.*, a.code as account_code, a.name as account_name
//       FROM journal_lines jl
//       JOIN accounts a ON jl.account_id = a.id
//       WHERE jl.journal_entry_id = $1
//     `, [req.params.id]);

//     res.json({
//       ...entry.rows[0],
//       lines: lines.rows
//     });

//   } catch (error) {
//     console.error('Get journal error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Create journal entry with double-entry validation
// router.post('/', authMiddleware, periodGuard, async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     // Validate input
//     const validation = journalSchema.safeParse(req.body);
//     // Check if period is closed
// const periodCheck = await pool.query('SELECT * FROM closed_periods WHERE period = $1', [req.body.period]);
// if (periodCheck.rows.length > 0) {
//   res.status(400).json({ error: `Period ${req.body.period} is closed. Cannot post entries.` });
//   return;
// }
//     if (!validation.success) {
//       res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
//       return;
//     }

//     const { description, entry_date, period, branch_id, lines } = req.body;

//     // Validate lines exist
//     if (!lines || lines.length < 2) {
//       res.status(400).json({ error: 'Journal entry must have at least 2 lines' });
//       return;
//     }

//     // Calculate totals
//     let totalDebit = 0;
//     let totalCredit = 0;

//     for (const line of lines) {
//       totalDebit += parseFloat(line.debit) || 0;
//       totalCredit += parseFloat(line.credit) || 0;
//     }

//     // Double-entry validation
//     if (Math.abs(totalDebit - totalCredit) > 0.001) {
//       res.status(400).json({ 
//         error: 'Journal entry is not balanced',
//         total_debit: totalDebit,
//         total_credit: totalCredit,
//         difference: totalDebit - totalCredit
//       });
//       return;
//     }

//     await client.query('BEGIN');

//     // Generate entry number
//     const entryNumber = `JV-${Date.now()}`;

//     // Create journal entry
//     const entry = await client.query(`
//       INSERT INTO journal_entries (entry_number, description, entry_date, period, branch_id, status, created_by)
//       VALUES ($1, $2, $3, $4, $5, 'posted', 1)
//       RETURNING *
//     `, [entryNumber, description, entry_date, period, branch_id || null]);

//     // Create journal lines
//     const createdLines = [];
//     for (const line of lines) {
//       const result = await client.query(`
//         INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//         VALUES ($1, $2, $3, $4, $5)
//         RETURNING *
//       `, [entry.rows[0].id, line.account_id, line.description, line.debit || 0, line.credit || 0]);
//       createdLines.push(result.rows[0]);
//     }

//     // Audit log
//     await client.query(`
//       INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
//       VALUES ($1, $2, $3, $4, $5)
//     `, [1, 'CREATE', 'journal_entries', entry.rows[0].id, 
//         JSON.stringify({ entry_number: entryNumber, description, total_debit: totalDebit, total_credit: totalCredit })]);

//     await client.query('COMMIT');

//     res.status(201).json({
//       ...entry.rows[0],
//       lines: createdLines
//     });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Create journal error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// // Trial Balance
// router.get('/reports/trial-balance', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         a.id,
//         a.code,
//         a.name,
//         a.type,
//         COALESCE(SUM(jl.debit), 0) as total_debit,
//         COALESCE(SUM(jl.credit), 0) as total_credit,
//         CASE 
//           WHEN COALESCE(SUM(jl.debit), 0) >= COALESCE(SUM(jl.credit), 0) 
//           THEN COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)
//           ELSE 0
//         END as debit_balance,
//         CASE 
//           WHEN COALESCE(SUM(jl.credit), 0) > COALESCE(SUM(jl.debit), 0) 
//           THEN COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
//           ELSE 0
//         END as credit_balance
//       FROM accounts a
//       LEFT JOIN journal_lines jl ON a.id = jl.account_id
//       LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id
//       WHERE je.status = 'posted' OR je.status IS NULL
//       GROUP BY a.id, a.code, a.name, a.type
//       ORDER BY a.code
//     `);

//     const totals = result.rows.reduce(
//       (acc, row) => ({
//         total_debit: acc.total_debit + Number(row.total_debit),
//         total_credit: acc.total_credit + Number(row.total_credit),
//         debit_balance: acc.debit_balance + Number(row.debit_balance),
//         credit_balance: acc.credit_balance + Number(row.credit_balance),
//       }),
//       { total_debit: 0, total_credit: 0, debit_balance: 0, credit_balance: 0 }
//     );

//     res.json({
//       accounts: result.rows.filter(row => Number(row.total_debit) > 0 || Number(row.total_credit) > 0),
//       totals
//     });

//   } catch (error) {
//     console.error('Trial balance error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// // Create recurring journal template
// router.post('/recurring', async (req, res) => {
//   try {
//     const { description, frequency, next_run_date, lines } = req.body;
//     const userId = (req as any).userId || 1;

//     const result = await pool.query(
//       'INSERT INTO recurring_journals (description, frequency, next_run_date, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
//       [description, frequency, next_run_date, userId]
//     );

//     for (const line of lines) {
//       await pool.query(
//         'INSERT INTO recurring_journal_lines (recurring_id, account_id, description, debit, credit) VALUES ($1, $2, $3, $4, $5)',
//         [result.rows[0].id, line.account_id, line.description, line.debit || 0, line.credit || 0]
//       );
//     }

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('Create recurring error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get recurring journals
// router.get('/recurring', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM recurring_journals WHERE is_active = true ORDER BY next_run_date');
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Generate recurring entries due today
// router.post('/recurring/generate', async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const due = await client.query(
//       "SELECT * FROM recurring_journals WHERE is_active = true AND next_run_date <= CURRENT_DATE"
//     );

//     let generated = 0;
//     for (const rec of due.rows) {
//       const lines = await client.query('SELECT * FROM recurring_journal_lines WHERE recurring_id = $1', [rec.id]);
      
//       const entryNumber = `JV-REC-${Date.now()}-${generated}`;
//       const journal = await client.query(
//         `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//          VALUES ($1, $2, CURRENT_DATE, 'JUL-2026', 'posted', $3) RETURNING id`,
//         [entryNumber, rec.description, rec.created_by]
//       );

//       for (const line of lines.rows) {
//         await client.query(
//           'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, $2, $3, $4, $5)',
//           [journal.rows[0].id, line.account_id, line.description, line.debit, line.credit]
//         );
//       }

//       // Update next run date
//       const nextDate = new Date(rec.next_run_date);
//       nextDate.setMonth(nextDate.getMonth() + 1);
//       await client.query('UPDATE recurring_journals SET next_run_date = $1 WHERE id = $2', [
//         nextDate.toISOString().split('T')[0], rec.id
//       ]);

//       generated++;
//     }

//     res.json({ message: `Generated ${generated} recurring entries`, generated });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// export default router;

import express from 'express';
import pool from '../db/pool.js';
import { z } from 'zod';
import { periodGuard } from '../middleware/period.js';
import { authMiddleware } from '../middleware/auth.js';

const journalSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  entry_date: z.string().min(1, 'Date is required'),
  period: z.string().min(1, 'Period is required'),
  branch_id: z.number().optional().nullable(),
  source_type: z.string().optional(),
  source_id: z.number().optional().nullable(),
  source_reference: z.string().optional().nullable(),
  lines: z.array(z.object({
    account_id: z.number().min(1, 'Account is required'),
    description: z.string().optional(),
    debit: z.number().min(0),
    credit: z.number().min(0),
  })).min(2, 'At least 2 lines required'),
});

const router = express.Router();

// ============================================
// ROUTES
// ============================================

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

// Get journals by source (subledger lookup)
router.get('/by-source/:source_type/:source_id', authMiddleware, async (req, res) => {
  try {
    const { source_type, source_id } = req.params;
    const result = await pool.query(`
      SELECT je.*, u.full_name as created_by_name,
             (SELECT COUNT(*) FROM journal_lines WHERE journal_entry_id = je.id) as line_count
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      WHERE EXISTS (
        SELECT 1 FROM journal_lines jl 
        WHERE jl.journal_entry_id = je.id 
        AND jl.source_type = $1 
        AND jl.source_id = $2::integer
      )
      ORDER BY je.created_at DESC
    `, [source_type, source_id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get journals by source error:', error);
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

    // Get subledger references if any
    const subledger = await pool.query(`
      SELECT * FROM subledger_references WHERE journal_entry_id = $1
    `, [req.params.id]);

    res.json({
      ...entry.rows[0],
      lines: lines.rows,
      subledger: subledger.rows[0] || null
    });

  } catch (error) {
    console.error('Get journal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create journal entry with double-entry validation and subledger tracking
router.post('/', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const validation = journalSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
      return;
    }

    const { 
      description, 
      entry_date, 
      period, 
      branch_id, 
      lines,
      source_type,
      source_id,
      source_reference
    } = req.body;

    const userId = (req as any).userId || 1;

    if (!lines || lines.length < 2) {
      res.status(400).json({ error: 'Journal entry must have at least 2 lines' });
      return;
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      totalDebit += parseFloat(line.debit) || 0;
      totalCredit += parseFloat(line.credit) || 0;
    }

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

    const entryNumber = `JV-${Date.now()}`;

    // Create journal entry
    const entry = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, branch_id, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, 'posted', $6)
      RETURNING *
    `, [entryNumber, description, entry_date, period, branch_id || null, userId]);

    const journalId = entry.rows[0].id;

    // Create journal lines with source tracking
    for (const line of lines) {
      await client.query(`
        INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        journalId,
        line.account_id,
        line.description || description,
        parseFloat(line.debit) || 0,
        parseFloat(line.credit) || 0,
        source_type || 'manual',
        source_id || null,
        source_reference || null
      ]);
    }

    // If this is a subledger transaction, create reference
    if (source_type && source_type !== 'manual' && source_id) {
      await client.query(`
        INSERT INTO subledger_references (
          source_type, source_id, journal_entry_id, transaction_date, amount
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        source_type,
        source_id,
        journalId,
        entry_date,
        totalDebit > totalCredit ? totalDebit : totalCredit
      ]);
    }

    // Audit log
    await client.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, 'CREATE', 'journal_entries', journalId, 
        JSON.stringify({ 
          entry_number: entryNumber, 
          description, 
          total_debit: totalDebit, 
          total_credit: totalCredit,
          source_type,
          source_id
        })]);

    await client.query('COMMIT');

    res.status(201).json({
      ...entry.rows[0],
      lines: lines,
      total_debit: totalDebit,
      total_credit: totalCredit
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create journal error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Reverse journal entry
router.post('/:id/reverse', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
    const journalId = req.params.id;
    const { reversal_date, reason } = req.body;
    const userId = (req as any).userId || 1;
    const period = (req as any).period || reversal_date.substring(0, 7);

    // Get the original journal
    const original = await client.query(
      'SELECT * FROM journal_entries WHERE id = $1',
      [journalId]
    );

    if (original.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (original.rows[0].status === 'reversed') {
      return res.status(400).json({ error: 'Journal entry is already reversed' });
    }

    // Get lines
    const lines = await client.query(
      'SELECT * FROM journal_lines WHERE journal_entry_id = $1',
      [journalId]
    );

    await client.query('BEGIN');

    // Create reversal entry
    const reversalNumber = `REV-${Date.now().toString().slice(-8)}`;
    const reversal = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, $3, $4, 'posted', $5)
      RETURNING id
    `, [reversalNumber, `Reversal: ${original.rows[0].description} (${reason || 'No reason'})`, 
        reversal_date, period, userId]);

    const reversalId = reversal.rows[0].id;

    // Create reversal lines (swap debits and credits)
    for (const line of lines.rows) {
      await client.query(`
        INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        reversalId,
        line.account_id,
        `REVERSAL: ${line.description}`,
        line.credit,  // Swap
        line.debit,   // Swap
        'reversal',
        journalId,
        original.rows[0].entry_number
      ]);
    }

    // Mark original as reversed
    await client.query(
      'UPDATE journal_entries SET status = $1 WHERE id = $2',
      ['reversed', journalId]
    );

    // Audit log
    await client.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, 'REVERSE', 'journal_entries', journalId,
        JSON.stringify({ 
          reversal_id: reversalId,
          reason,
          original_entry: original.rows[0].entry_number
        })]);

    await client.query('COMMIT');

    res.json({
      message: 'Journal entry reversed',
      reversal_id: reversalId,
      reversal_entry: reversalNumber
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reverse journal error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Trial Balance
router.get('/reports/trial-balance', authMiddleware, async (req, res) => {
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

// ============================================
// RECURRING JOURNALS
// ============================================

// Create recurring journal template
router.post('/recurring', authMiddleware, async (req, res) => {
  try {
    const { description, frequency, next_run_date, lines } = req.body;
    const userId = (req as any).userId || 1;

    const result = await pool.query(
      `INSERT INTO recurring_journals (description, frequency, next_run_date, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [description, frequency, next_run_date, userId]
    );

    for (const line of lines) {
      await pool.query(
        `INSERT INTO recurring_journal_lines (recurring_id, account_id, description, debit, credit) 
         VALUES ($1, $2, $3, $4, $5)`,
        [result.rows[0].id, line.account_id, line.description, line.debit || 0, line.credit || 0]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create recurring error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recurring journals
router.get('/recurring', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM recurring_journals WHERE is_active = true ORDER BY next_run_date'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate recurring entries due today
router.post('/recurring/generate', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = (req as any).userId || 1;
    const period = new Date().toISOString().substring(0, 7);

    const due = await client.query(
      "SELECT * FROM recurring_journals WHERE is_active = true AND next_run_date <= CURRENT_DATE"
    );

    let generated = 0;
    for (const rec of due.rows) {
      const lines = await client.query(
        'SELECT * FROM recurring_journal_lines WHERE recurring_id = $1',
        [rec.id]
      );
      
      const entryNumber = `JV-REC-${Date.now()}-${generated}`;
      const journal = await client.query(`
        INSERT INTO journal_entries (
          entry_number, description, entry_date, period, status, created_by
        ) VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id
      `, [entryNumber, rec.description, period, userId]);

      for (const line of lines.rows) {
        await client.query(`
          INSERT INTO journal_lines (
            journal_entry_id, account_id, description, debit, credit,
            source_type, source_id, source_reference
          ) VALUES ($1, $2, $3, $4, $5, 'recurring', $6, $7)
        `, [
          journal.rows[0].id, 
          line.account_id, 
          line.description, 
          line.debit, 
          line.credit,
          rec.id,
          entryNumber
        ]);
      }

      const nextDate = new Date(rec.next_run_date);
      nextDate.setMonth(nextDate.getMonth() + 1);
      await client.query(
        'UPDATE recurring_journals SET next_run_date = $1 WHERE id = $2',
        [nextDate.toISOString().split('T')[0], rec.id]
      );

      generated++;
    }

    res.json({ message: `Generated ${generated} recurring entries`, generated });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Generate recurring error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

export default router;