import express from 'express';
import pool from '../db/pool.js';
import { z } from 'zod';

const invoiceSchema = z.object({
  customer_id: z.number().min(1),
  invoice_date: z.string().min(1),
  due_date: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
});

const router = express.Router();

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, c.name as customer_name, u.full_name as created_by_name
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.created_by = u.id
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create invoice
router.post('/', async (req, res) => {
  const client = await pool.connect();
  const validation = invoiceSchema.safeParse(req.body);
if (!validation.success) {
  res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
  return;
}
  try {
    const { customer_id, invoice_date, due_date, description, amount } = req.body;
    const taxRate = 0.075; // 7.5% VAT
    const subtotal = parseFloat(amount);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create invoice
    const invoice = await client.query(`
      INSERT INTO invoices (invoice_number, customer_id, invoice_date, due_date, description, subtotal, tax_amount, total, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'posted', 1)
      RETURNING *
    `, [invoiceNumber, customer_id, invoice_date, due_date, description, subtotal, taxAmount, total]);

    // Create journal entry for the invoice
    const entryNumber = `JV-${Date.now()}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
      VALUES ($1, $2, $3, 'JUL-2026', 'posted', 1)
      RETURNING id
    `, [entryNumber, `Invoice ${invoiceNumber} - ${description}`, invoice_date]);

    // Debit Accounts Receivable
    await client.query(`
      INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
      VALUES ($1, 5, $2, $3, 0)
    `, [journal.rows[0].id, `Invoice ${invoiceNumber}`, total]);

    // Credit Revenue
    await client.query(`
      INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
      VALUES ($1, 22, $2, 0, $3)
    `, [journal.rows[0].id, `Revenue from ${invoiceNumber}`, subtotal]);

    // Credit VAT Payable (if tax > 0)
    if (taxAmount > 0) {
      await client.query(`
        INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
        VALUES ($1, 12, $2, 0, $3)
      `, [journal.rows[0].id, `VAT on ${invoiceNumber}`, taxAmount]);
    }

    // Update customer balance
    await client.query(
      'UPDATE customers SET current_balance = current_balance + $1 WHERE id = $2',
      [total, customer_id]
    );

    await client.query('COMMIT');

    res.status(201).json(invoice.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Create credit note
router.post('/credit-note', async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, invoice_id, amount, reason } = req.body;
    const creditAmount = parseFloat(amount);
    const noteNumber = `CN-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create credit note (stored in invoices with negative total)
    await client.query(`
      INSERT INTO invoices (invoice_number, customer_id, invoice_date, due_date, description, subtotal, tax_amount, total, status, created_by)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, $3, 0, 0, $4, 'credit_note', $5)
    `, [noteNumber, customer_id, reason || 'Credit Note', -creditAmount, (req as any).userId || 1]);

    // Journal entry: Dr Revenue, Cr AR
    const entryNumber = `JV-${Date.now()}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
      VALUES ($1, $2, CURRENT_DATE, 'JUL-2026', 'posted', $3) RETURNING id
    `, [entryNumber, `Credit Note ${noteNumber} - ${reason}`, (req as any).userId || 1]);

    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 22, $2, $3, 0)',
      [journal.rows[0].id, 'Revenue reversal', creditAmount]
    );
    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 5, $2, 0, $3)',
      [journal.rows[0].id, 'AR reduction', creditAmount]
    );

    // Update customer balance
    await client.query('UPDATE customers SET current_balance = current_balance - $1 WHERE id = $2', [creditAmount, customer_id]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Credit note created', note_number: noteNumber });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});
export default router;