import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create delegation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { delegate_id, transaction_type, start_date, end_date } = req.body;
    const userId = (req as any).userId || 1;

    const result = await pool.query(
      `INSERT INTO approval_delegations (delegator_id, delegate_id, transaction_type, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, delegate_id, transaction_type, start_date, end_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active delegations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, 
        u1.full_name as delegator_name,
        u2.full_name as delegate_name
      FROM approval_delegations d
      JOIN users u1 ON d.delegator_id = u1.id
      JOIN users u2 ON d.delegate_id = u2.id
      WHERE d.is_active = true AND d.end_date >= CURRENT_DATE
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update SLA tracking on approval submission
router.post('/check-escalation', authMiddleware, async (req, res) => {
  try {
    // Escalate pending approvals older than 48 hours
    const result = await pool.query(`
      UPDATE approvals 
      SET escalated = true, escalation_level = escalation_level + 1
      WHERE status = 'pending' 
        AND submitted_at < NOW() - INTERVAL '48 hours'
        AND escalated = false
      RETURNING *
    `);

    res.json({ escalated: result.rows.length, approvals: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;