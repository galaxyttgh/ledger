import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Get all receipts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, c.name as customer_name, i.invoice_number
      FROM receipts r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN invoices i ON r.invoice_id = i.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create receipt
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, invoice_id, amount, payment_date, payment_method } = req.body;
    const receiptAmount = parseFloat(amount);
    const receiptNumber = `RCPT-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create receipt
    const receipt = await client.query(`
      INSERT INTO receipts (receipt_number, customer_id, invoice_id, amount, payment_date, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [receiptNumber, customer_id, invoice_id, receiptAmount, payment_date, payment_method || 'bank_transfer']);

    // Create journal entry
    const entryNumber = `JV-${Date.now()}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
      VALUES ($1, $2, $3, 'JUL-2026', 'posted', 1)
      RETURNING id
    `, [entryNumber, `Payment received - ${receiptNumber}`, payment_date]);

    // Debit Bank
    await client.query(`
      INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
      VALUES ($1, 4, $2, $3, 0)
    `, [journal.rows[0].id, `Receipt ${receiptNumber}`, receiptAmount]);

    // Credit Accounts Receivable
    await client.query(`
      INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
      VALUES ($1, 5, $2, 0, $3)
    `, [journal.rows[0].id, `Receipt ${receiptNumber}`, receiptAmount]);

    // Update customer balance (reduce what they owe)
    await client.query(
      'UPDATE customers SET current_balance = current_balance - $1 WHERE id = $2',
      [receiptAmount, customer_id]
    );

    // Update invoice status if fully paid
    if (invoice_id) {
      const invoice = await client.query('SELECT total FROM invoices WHERE id = $1', [invoice_id]);
      const receipts = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as total_paid FROM receipts WHERE invoice_id = $1',
        [invoice_id]
      );
      if (parseFloat(receipts.rows[0].total_paid) >= parseFloat(invoice.rows[0].total)) {
        await client.query("UPDATE invoices SET status = 'paid' WHERE id = $1", [invoice_id]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json(receipt.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create receipt error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

export default router;