import express from 'express';
import pool from '../db/pool.js';

import { z } from 'zod';

const billSchema = z.object({
  supplier_id: z.number().min(1),
  bill_date: z.string().min(1),
  due_date: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
});

const router = express.Router();

// Get all bills
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, s.name as supplier_name, u.full_name as created_by_name
      FROM bills b
      JOIN suppliers s ON b.supplier_id = s.id
      LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create bill
// Create bill
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Validate input
    const validation = billSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
      return;
    }

    const { supplier_id, bill_date, due_date, description, amount } = req.body;
    const subtotal = parseFloat(amount);
    const vatRate = 0.075;
    const taxAmount = subtotal * vatRate;
    const total = subtotal + taxAmount;
    const userId = (req as any).userId || 1;

    const billNumber = `BILL-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create bill
    const bill = await client.query(`
      INSERT INTO bills (bill_number, supplier_id, bill_date, due_date, description, subtotal, tax_amount, total, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'posted', $9)
      RETURNING *
    `, [billNumber, supplier_id, bill_date, due_date, description, subtotal, taxAmount, total, userId]);

    // Create journal entry
    const entryNumber = `JV-${Date.now()}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
      VALUES ($1, $2, $3, 'JUL-2026', 'posted', $4)
      RETURNING id
    `, [entryNumber, `Bill ${billNumber} - ${description}`, bill_date, userId]);

    // Debit Expense
    await client.query(`
      INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
      VALUES ($1, 27, $2, $3, 0)
    `, [journal.rows[0].id, `Expense from ${billNumber}`, subtotal]);

    // Debit VAT
    if (taxAmount > 0) {
      await client.query(`
        INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
        VALUES ($1, 12, $2, $3, 0)
      `, [journal.rows[0].id, `VAT on ${billNumber}`, taxAmount]);
    }

    // Credit Accounts Payable
    await client.query(`
      INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
      VALUES ($1, 11, $2, 0, $3)
    `, [journal.rows[0].id, `Payable for ${billNumber}`, total]);

    // Update supplier balance
    await client.query(
      'UPDATE suppliers SET current_balance = current_balance + $1 WHERE id = $2',
      [total, supplier_id]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'CREATE', 'bills', $2, $3)`,
      [userId, bill.rows[0].id, JSON.stringify({ bill_number: billNumber, amount: total })]
    );

    await client.query('COMMIT');

    res.status(201).json(bill.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create bill error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Create debit note
router.post('/debit-note', async (req, res) => {
  const client = await pool.connect();
  try {
    const { supplier_id, amount, reason } = req.body;
    const debitAmount = parseFloat(amount);
    const noteNumber = `DN-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    await client.query(`
      INSERT INTO bills (bill_number, supplier_id, bill_date, due_date, description, subtotal, tax_amount, total, status, created_by)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, $3, 0, 0, $4, 'debit_note', $5)
    `, [noteNumber, supplier_id, reason || 'Debit Note', -debitAmount, (req as any).userId || 1]);

    const entryNumber = `JV-${Date.now()}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
      VALUES ($1, $2, CURRENT_DATE, 'JUL-2026', 'posted', $3) RETURNING id
    `, [entryNumber, `Debit Note ${noteNumber}`, (req as any).userId || 1]);

    // Dr AP, Cr Expense
    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 11, $2, $3, 0)',
      [journal.rows[0].id, 'AP reduction', debitAmount]
    );
    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 27, $2, 0, $3)',
      [journal.rows[0].id, 'Expense reversal', debitAmount]
    );

    await client.query('UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2', [debitAmount, supplier_id]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Debit note created', note_number: noteNumber });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

export default router;