import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Get all payments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.name as supplier_name, b.bill_number
      FROM payments p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN bills b ON p.bill_id = b.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payment
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { supplier_id, bill_id, amount, payment_date, payment_method } = req.body;
    const paymentAmount = parseFloat(amount);
    const paymentNumber = `PAY-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create payment
    const payment = await client.query(`
      INSERT INTO payments (payment_number, supplier_id, bill_id, amount, payment_date, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [paymentNumber, supplier_id, bill_id, paymentAmount, payment_date, payment_method || 'bank_transfer']);

    // Create journal entry
    const entryNumber = `JV-${Date.now()}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
      VALUES ($1, $2, $3, 'JUL-2026', 'posted', 1)
      RETURNING id
    `, [entryNumber, `Payment made - ${paymentNumber}`, payment_date]);

    // Debit Accounts Payable (reduce what we owe)
    await client.query(`
      INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
      VALUES ($1, 11, $2, $3, 0)
    `, [journal.rows[0].id, `Payment ${paymentNumber}`, paymentAmount]);

    // Credit Bank (money leaves bank)
    await client.query(`
      INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
      VALUES ($1, 4, $2, 0, $3)
    `, [journal.rows[0].id, `Payment ${paymentNumber}`, paymentAmount]);

    // Update supplier balance
    await client.query(
      'UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2',
      [paymentAmount, supplier_id]
    );

    // Update bill status if fully paid
    if (bill_id) {
      const bill = await client.query('SELECT total FROM bills WHERE id = $1', [bill_id]);
      const payments = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE bill_id = $1',
        [bill_id]
      );
      if (parseFloat(payments.rows[0].total_paid) >= parseFloat(bill.rows[0].total)) {
        await client.query("UPDATE bills SET status = 'paid' WHERE id = $1", [bill_id]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json(payment.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

export default router;