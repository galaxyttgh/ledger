// import express from 'express';
// import pool from '../db/pool.js';
// import { periodGuard } from '../middleware/period.js';
// import { z } from 'zod';

// const billSchema = z.object({
//   supplier_id: z.number().min(1),
//   bill_date: z.string().min(1),
//   due_date: z.string().min(1),
//   description: z.string().min(1),
//   amount: z.number().positive('Amount must be positive'),
// });

// const router = express.Router();

// // Get all bills
// router.get('/', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT b.*, s.name as supplier_name, u.full_name as created_by_name
//       FROM bills b
//       JOIN suppliers s ON b.supplier_id = s.id
//       LEFT JOIN users u ON b.created_by = u.id
//       ORDER BY b.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get bills error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// // Create bill
// router.post('/', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     // Validate input
//     const validation = billSchema.safeParse(req.body);
//     if (!validation.success) {
//       res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
//       return;
//     }

//     const { supplier_id, bill_date, due_date, description, amount } = req.body;
//     const subtotal = parseFloat(amount);
//     const vatRate = 0.075;
//     const taxAmount = subtotal * vatRate;
//     const total = subtotal + taxAmount;
//     const userId = (req as any).userId || 1;

//     const billNumber = `BILL-${Date.now().toString().slice(-8)}`;

//     await client.query('BEGIN');

//     // Create bill
//     const bill = await client.query(`
//       INSERT INTO bills (bill_number, supplier_id, bill_date, due_date, description, subtotal, tax_amount, total, status, created_by)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'posted', $9)
//       RETURNING *
//     `, [billNumber, supplier_id, bill_date, due_date, description, subtotal, taxAmount, total, userId]);

//     // Create journal entry
//     const entryNumber = `JV-${Date.now()}`;
//     const journal = await client.query(`
//       INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//       VALUES ($1, $2, $3, 'JUL-2026', 'posted', $4)
//       RETURNING id
//     `, [entryNumber, `Bill ${billNumber} - ${description}`, bill_date, userId]);

//     // Debit Expense
//     await client.query(`
//       INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//       VALUES ($1, 27, $2, $3, 0)
//     `, [journal.rows[0].id, `Expense from ${billNumber}`, subtotal]);

//     // Debit VAT
//     if (taxAmount > 0) {
//       await client.query(`
//         INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//         VALUES ($1, 12, $2, $3, 0)
//       `, [journal.rows[0].id, `VAT on ${billNumber}`, taxAmount]);
//     }

//     // Credit Accounts Payable
//     await client.query(`
//       INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//       VALUES ($1, 11, $2, 0, $3)
//     `, [journal.rows[0].id, `Payable for ${billNumber}`, total]);

//     // Update supplier balance
//     await client.query(
//       'UPDATE suppliers SET current_balance = current_balance + $1 WHERE id = $2',
//       [total, supplier_id]
//     );

//     // Audit log
//     await client.query(
//       `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
//        VALUES ($1, 'CREATE', 'bills', $2, $3)`,
//       [userId, bill.rows[0].id, JSON.stringify({ bill_number: billNumber, amount: total })]
//     );

//     await client.query('COMMIT');

//     res.status(201).json(bill.rows[0]);

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Create bill error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// // Create debit note
// router.post('/debit-note', async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { supplier_id, amount, reason } = req.body;
//     const debitAmount = parseFloat(amount);
//     const noteNumber = `DN-${Date.now().toString().slice(-8)}`;

//     await client.query('BEGIN');

//     await client.query(`
//       INSERT INTO bills (bill_number, supplier_id, bill_date, due_date, description, subtotal, tax_amount, total, status, created_by)
//       VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, $3, 0, 0, $4, 'debit_note', $5)
//     `, [noteNumber, supplier_id, reason || 'Debit Note', -debitAmount, (req as any).userId || 1]);

//     const entryNumber = `JV-${Date.now()}`;
//     const journal = await client.query(`
//       INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//       VALUES ($1, $2, CURRENT_DATE, 'JUL-2026', 'posted', $3) RETURNING id
//     `, [entryNumber, `Debit Note ${noteNumber}`, (req as any).userId || 1]);

//     // Dr AP, Cr Expense
//     await client.query(
//       'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 11, $2, $3, 0)',
//       [journal.rows[0].id, 'AP reduction', debitAmount]
//     );
//     await client.query(
//       'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 27, $2, 0, $3)',
//       [journal.rows[0].id, 'Expense reversal', debitAmount]
//     );

//     await client.query('UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2', [debitAmount, supplier_id]);

//     await client.query('COMMIT');
//     res.status(201).json({ message: 'Debit note created', note_number: noteNumber });

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
import { periodGuard } from '../middleware/period.js';
import { authMiddleware } from '../middleware/auth.js';
import { z } from 'zod';

const billSchema = z.object({
  supplier_id: z.number().min(1),
  bill_date: z.string().min(1),
  due_date: z.string().min(1),
  description: z.string().min(1),
  subtotal: z.number().positive('Amount must be positive'),
  tax_code: z.string().optional(),
});

const router = express.Router();

// ============================================
// TAX CALCULATION ENGINE (Internal)
// ============================================

const getTaxRate = async (taxCode: string, transactionDate: string) => {
  const result = await pool.query(
    `SELECT * FROM tax_codes 
     WHERE code = $1 
     AND is_active = true
     AND effective_from <= $2
     AND (effective_to IS NULL OR effective_to >= $2)`,
    [taxCode, transactionDate]
  );

  if (result.rows.length === 0) {
    return { rate: 7.5, code: 'VAT-STANDARD', name: 'VAT Standard' };
  }

  return result.rows[0];
};

const calculateTax = async (amount: number, taxCode: string | undefined, transactionDate: string) => {
  if (!taxCode) {
    return { taxAmount: 0, rate: 0, taxCode: null };
  }

  const tax = await getTaxRate(taxCode, transactionDate);
  const taxAmount = amount * (tax.rate / 100);

  return {
    taxAmount: Math.round(taxAmount * 100) / 100,
    rate: tax.rate,
    taxCode: tax.code,
    taxName: tax.name
  };
};

// ============================================
// ROUTES
// ============================================

// Get all bills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, 
             s.name as supplier_name, 
             u.full_name as created_by_name,
             je.entry_number as journal_entry
      FROM bills b
      JOIN suppliers s ON b.supplier_id = s.id
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN journal_entries je ON b.journal_entry_id = je.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single bill
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const bill = await pool.query(`
      SELECT b.*, s.name as supplier_name, s.code as supplier_code
      FROM bills b
      JOIN suppliers s ON b.supplier_id = s.id
      WHERE b.id = $1
    `, [req.params.id]);

    if (bill.rows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill.rows[0]);
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create bill with subledger tracking
router.post('/', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const validation = billSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
      return;
    }

    const { 
      supplier_id, 
      bill_date, 
      due_date, 
      description, 
      subtotal,
      tax_code
    } = req.body;

    const userId = (req as any).userId || 1;
    const period = (req as any).period || bill_date.substring(0, 7);

    // Calculate tax
    const taxCalculation = await calculateTax(subtotal, tax_code, bill_date);
    const taxAmount = taxCalculation.taxAmount;
    const total = subtotal + taxAmount;

    const billNumber = `BILL-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create bill
    const bill = await client.query(`
      INSERT INTO bills (
        bill_number, supplier_id, bill_date, due_date, description, 
        subtotal, tax_amount, total, tax_code, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'posted', $10)
      RETURNING *
    `, [billNumber, supplier_id, bill_date, due_date, description, 
        subtotal, taxAmount, total, tax_code || 'VAT-STANDARD', userId]);

    const billId = bill.rows[0].id;

    // ============================================
    // CREATE JOURNAL ENTRY WITH SUBLEDGER TRACKING
    // ============================================
    
    const entryNumber = `JV-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, $3, $4, 'posted', $5)
      RETURNING id
    `, [entryNumber, `Bill ${billNumber} - ${description}`, bill_date, period, userId]);

    const journalId = journal.rows[0].id;

    // 1. Debit Expense (Asset)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 27, $2, $3, 0, 'bill', $4, $5)
    `, [journalId, `Expense - ${billNumber}`, subtotal, billId, billNumber]);

    // 2. Debit VAT Input (if tax applies)
    if (taxAmount > 0) {
      await client.query(`
        INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 12, $2, $3, 0, 'bill', $4, $5)
      `, [journalId, `VAT Input - ${billNumber}`, taxAmount, billId, billNumber]);
    }

    // 3. Credit Accounts Payable (Supplier)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 11, $2, 0, $3, 'bill', $4, $5)
    `, [journalId, `AP - ${billNumber}`, total, billId, billNumber]);

    // Link bill to journal
    await client.query(
      'UPDATE bills SET journal_entry_id = $1 WHERE id = $2',
      [journalId, billId]
    );

    // Create subledger reference
    await client.query(`
      INSERT INTO subledger_references (
        source_type, source_id, journal_entry_id, transaction_date, amount
      ) VALUES ($1, $2, $3, $4, $5)
    `, ['bill', billId, journalId, bill_date, total]);

    // Update supplier balance
    await client.query(
      'UPDATE suppliers SET current_balance = current_balance + $1 WHERE id = $2',
      [total, supplier_id]
    );

    // Audit log
    await client.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, 'CREATE', 'bills', $2, $3)
    `, [userId, billId, JSON.stringify({ bill_number: billNumber, total, supplier_id })]);

    await client.query('COMMIT');

    res.status(201).json({
      ...bill.rows[0],
      journal_entry_id: journalId,
      journal_entry: entryNumber,
      tax_calculation: taxCalculation
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create bill error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Create debit note
router.post('/debit-note', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
    const { supplier_id, amount, reason } = req.body;
    const userId = (req as any).userId || 1;
    const period = (req as any).period || new Date().toISOString().substring(0, 7);
    const debitAmount = parseFloat(amount);
    const noteNumber = `DN-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create debit note
    const bill = await client.query(`
      INSERT INTO bills (
        bill_number, supplier_id, bill_date, due_date, description, 
        subtotal, tax_amount, total, status, created_by
      ) VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, $3, 0, 0, $4, 'debit_note', $5)
      RETURNING id
    `, [noteNumber, supplier_id, reason || 'Debit Note', -debitAmount, userId]);

    const billId = bill.rows[0].id;

    // Journal entry with subledger tracking
    const entryNumber = `JV-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4)
      RETURNING id
    `, [entryNumber, `Debit Note ${noteNumber} - ${reason}`, period, userId]);

    const journalId = journal.rows[0].id;

    // Dr AP (reduction)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 11, $2, $3, 0, 'bill', $4, $5)
    `, [journalId, `AP reduction - ${noteNumber}`, debitAmount, billId, noteNumber]);

    // Cr Expense (reversal)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 27, $2, 0, $3, 'bill', $4, $5)
    `, [journalId, `Expense reversal - ${noteNumber}`, debitAmount, billId, noteNumber]);

    // Link to journal
    await client.query(
      'UPDATE bills SET journal_entry_id = $1 WHERE id = $2',
      [journalId, billId]
    );

    // Update supplier balance
    await client.query(
      'UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2',
      [debitAmount, supplier_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ 
      message: 'Debit note created', 
      note_number: noteNumber,
      journal_entry: entryNumber
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Debit note error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Update bill status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const userId = (req as any).userId || 1;

    const result = await pool.query(
      'UPDATE bills SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'UPDATE_STATUS', 'bills', $2, $3)`,
      [userId, req.params.id, JSON.stringify({ status })]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update bill status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;