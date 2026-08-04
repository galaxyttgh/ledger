import express from 'express';
import pool from '../db/pool.js';
import { sodCheck } from '../middleware/sod.js';

const router = express.Router();

// Submit for approval
router.post('/submit', async (req, res) => {
  try {
    const { transaction_type, transaction_id } = req.body;

    // Check if rule exists
    const rule = await pool.query(
      'SELECT * FROM approval_rules WHERE transaction_type = $1 AND is_active = true ORDER BY priority',
      [transaction_type]
    );

    if (rule.rows.length === 0) {
      res.json({ message: 'No approval required', status: 'auto_approved' });
      return;
    }

    // const result = await pool.query(
    //   `INSERT INTO approvals (transaction_type, transaction_id, submitted_by, status)
    //    VALUES ($1, $2, 1, 'pending') RETURNING *`,
    //   [transaction_type, transaction_id]
    // );

    // Set SLA due date (48 hours from submission)
const slaDueDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

const result = await pool.query(
  `INSERT INTO approvals (transaction_type, transaction_id, submitted_by, status, sla_due_date)
   VALUES ($1, $2, 1, 'pending', $3) RETURNING *`,
  [transaction_type, transaction_id, slaDueDate]
);

    res.status(201).json({ message: 'Submitted for approval', approval: result.rows[0] });

  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending approvals
router.get('/pending', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.full_name as submitted_by_name
      FROM approvals a
      LEFT JOIN users u ON a.submitted_by = u.id
      WHERE a.status = 'pending'
      ORDER BY a.submitted_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve
router.post('/:id/approve', sodCheck, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      `UPDATE approvals SET status = 'approved', approved_by = 1, approved_at = NOW() WHERE id = $1`,
      [id]
    );

    // Update the transaction status
    const approval = await pool.query('SELECT * FROM approvals WHERE id = $1', [id]);
    const { transaction_type, transaction_id } = approval.rows[0];

    if (transaction_type === 'journal') {
      await pool.query("UPDATE journal_entries SET status = 'approved' WHERE id = $1", [transaction_id]);
    } else if (transaction_type === 'invoice') {
      await pool.query("UPDATE invoices SET status = 'approved' WHERE id = $1", [transaction_id]);
    } else if (transaction_type === 'bill') {
      await pool.query("UPDATE bills SET status = 'approved' WHERE id = $1", [transaction_id]);
    }

    res.json({ message: 'Approved successfully' });

  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    await pool.query(
      `UPDATE approvals SET status = 'rejected', approved_by = 1, approved_at = NOW(), comments = $1 WHERE id = $2`,
      [comments || 'Rejected', id]
    );

    res.json({ message: 'Rejected' });

  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get approval history
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, 
        u1.full_name as submitted_by_name,
        u2.full_name as approved_by_name
      FROM approvals a
      LEFT JOIN users u1 ON a.submitted_by = u1.id
      LEFT JOIN users u2 ON a.approved_by = u2.id
      ORDER BY a.submitted_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get approval rules
router.get('/rules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM approval_rules ORDER BY transaction_type, priority');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;