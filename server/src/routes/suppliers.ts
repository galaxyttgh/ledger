import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create supplier
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const code = `SUPP-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO suppliers (code, name, email, phone, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [code, name, email, phone, address]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [1, 'CREATE', 'suppliers', result.rows[0].id, JSON.stringify(result.rows[0])]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;