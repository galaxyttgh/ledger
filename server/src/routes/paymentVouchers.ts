import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all vouchers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pv.*, 
        s.name as supplier_name,
        u1.full_name as requested_by_name,
        u2.full_name as approved_by_name
      FROM payment_vouchers pv
      LEFT JOIN suppliers s ON pv.supplier_id = s.id
      LEFT JOIN users u1 ON pv.requested_by = u1.id
      LEFT JOIN users u2 ON pv.approved_by = u2.id
      ORDER BY pv.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create voucher
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { payment_id, supplier_id, amount, purpose } = req.body;
    const userId = (req as any).userId || 1;
    const voucherNumber = `PV-${Date.now().toString().slice(-8)}`;

    const result = await pool.query(
      `INSERT INTO payment_vouchers (voucher_number, payment_id, supplier_id, amount, purpose, requested_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [voucherNumber, payment_id, supplier_id, amount, purpose, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve voucher
router.post('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId || 1;
    await pool.query(
      'UPDATE payment_vouchers SET status = $1, approved_by = $2 WHERE id = $3',
      ['approved', userId, req.params.id]
    );
    res.json({ message: 'Voucher approved' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Print voucher (get single)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pv.*, 
        s.name as supplier_name, s.address as supplier_address,
        u1.full_name as requested_by_name,
        u2.full_name as approved_by_name
      FROM payment_vouchers pv
      LEFT JOIN suppliers s ON pv.supplier_id = s.id
      LEFT JOIN users u1 ON pv.requested_by = u1.id
      LEFT JOIN users u2 ON pv.approved_by = u2.id
      WHERE pv.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;