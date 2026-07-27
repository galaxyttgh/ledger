import express from 'express';
import pool from '../db/pool.js';

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
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { supplier_id, bill_date, due_date, description, amount } = req.body;
    const subtotal = parseFloat(amount);
    const vatRate = 0.075;
    const taxAmount = subtotal * vatRate;
    const total = subtotal + taxAmount;

    const billNumber = `BILL-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create bill
    const bill = await client.query(`
      INSERT INTO bills (bill_number, supplier_id, bill_date, due_date, description, subtotal, tax_amount, total, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'posted', 1)
      RETURNING *
    `, [billNumber, supplier_id, bill_date, due_date, description, subtotal, taxAmount, total]);

    // Create journal entry
    const entryNumber = `JV-${Date.now()}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
      VALUES ($1, $2, $3, 'JUL-2026', 'posted', 1)
      RETURNING id
    `, [entryNumber, `Bill ${billNumber} - ${description}`, bill_date]);

    // Debit Expense (using Office Supplies account 5400)
    await client.query(`
      INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
      VALUES ($1, 27, $2, $3, 0)
    `, [journal.rows[0].id, `Expense from ${billNumber}`, subtotal]);

    // Debit VAT (if applicable)
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

export default router;