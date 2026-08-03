import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

const quotationSchema = z.object({
  customer_id: z.number().min(1),
  quotation_date: z.string().min(1),
  expiry_date: z.string().optional(),
  description: z.string().min(1),
  subtotal: z.number().positive(),
});

// Get all quotations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, c.name as customer_name, u.full_name as created_by_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ORDER BY q.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create quotation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validation = quotationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
      return;
    }

    const { customer_id, quotation_date, expiry_date, description, subtotal, reference_number, notes } = req.body;
    const userId = (req as any).userId || 1;
    const taxAmount = subtotal * 0.075;
    const total = subtotal + taxAmount;
    const quotationNumber = `QT-${Date.now().toString().slice(-8)}`;

    const result = await pool.query(
      `INSERT INTO quotations (quotation_number, customer_id, quotation_date, expiry_date, description, subtotal, tax_amount, total, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', $9) RETURNING *`,
      [quotationNumber, customer_id, quotation_date, expiry_date, description, subtotal, taxAmount, total, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Convert quotation to invoice
router.post('/:id/convert', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const quotation = await client.query('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
    if (quotation.rows.length === 0) {
      res.status(404).json({ error: 'Quotation not found' });
      return;
    }

    const q = quotation.rows[0];
    if (q.status === 'converted') {
      res.status(400).json({ error: 'Quotation already converted' });
      return;
    }

    const userId = (req as any).userId || 1;
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    await client.query('BEGIN');

    // Create invoice
    const invoice = await client.query(
      `INSERT INTO invoices (invoice_number, customer_id, invoice_date, due_date, description, subtotal, tax_amount, total, tax_code, status, created_by)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, 'VAT-STANDARD', 'posted', $8) RETURNING *`,
      [invoiceNumber, q.customer_id, dueDate.toISOString().split('T')[0], q.description, q.subtotal, q.tax_amount, q.total, userId]
    );

    // Create journal entry
    const entryNumber = `JV-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(
      `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
       VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
      [entryNumber, `Invoice ${invoiceNumber} - ${q.description}`, new Date().toISOString().substring(0, 7), userId]
    );

    const journalId = journal.rows[0].id;
    const invoiceId = invoice.rows[0].id;

    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 5, $2, $3, 0, $4, $5, $6)',
      [journalId, `AR - ${invoiceNumber}`, q.total, 'invoice', invoiceId, invoiceNumber]
    );
    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 22, $2, 0, $3, $4, $5, $6)',
      [journalId, `Revenue - ${invoiceNumber}`, q.subtotal, 'invoice', invoiceId, invoiceNumber]
    );
    if (q.tax_amount > 0) {
      await client.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 12, $2, 0, $3, $4, $5, $6)',
        [journalId, `VAT - ${invoiceNumber}`, q.tax_amount, 'invoice', invoiceId, invoiceNumber]
      );
    }

    await client.query('UPDATE invoices SET journal_entry_id = $1 WHERE id = $2', [journalId, invoiceId]);
    await client.query('UPDATE customers SET current_balance = current_balance + $1 WHERE id = $2', [q.total, q.customer_id]);
    await client.query("UPDATE quotations SET status = 'converted', converted_to_invoice_id = $1 WHERE id = $2", [invoiceId, req.params.id]);

    await client.query('COMMIT');

    res.json({ message: 'Quotation converted to invoice', quotation_id: req.params.id, invoice_id: invoiceId, invoice_number: invoiceNumber });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Convert error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

export default router;