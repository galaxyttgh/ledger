import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get collection notes for an invoice
router.get('/invoice/:invoiceId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cn.*, u.full_name as created_by_name
       FROM collection_notes cn
       LEFT JOIN users u ON cn.created_by = u.id
       WHERE cn.invoice_id = $1
       ORDER BY cn.created_at DESC`,
      [req.params.invoiceId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all overdue invoices with collection status
router.get('/overdue', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, c.name as customer_name, c.phone,
        (SELECT COUNT(*) FROM collection_notes WHERE invoice_id = i.id) as follow_up_count,
        (SELECT MAX(created_at) FROM collection_notes WHERE invoice_id = i.id) as last_follow_up
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.status != 'paid' AND i.due_date < CURRENT_DATE
      ORDER BY i.due_date ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create collection note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { invoice_id, customer_id, contact_date, contact_method, notes, follow_up_date, status } = req.body;
    const userId = (req as any).userId || 1;

    const result = await pool.query(
      `INSERT INTO collection_notes (invoice_id, customer_id, contact_date, contact_method, notes, follow_up_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [invoice_id, customer_id, contact_date, contact_method, notes, follow_up_date, status || 'pending', userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;