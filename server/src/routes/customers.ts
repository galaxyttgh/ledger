import express from 'express';
import pool from '../db/pool.js';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const validation = customerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
      return;
    }

    const { name, email, phone, address } = req.body;
    const userId = (req as any).userId || 1;
    const code = `CUST-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO customers (code, name, email, phone, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [code, name, email, phone, address]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'CREATE', 'customers', $2, $3)`,
      [userId, result.rows[0].id, JSON.stringify(result.rows[0])]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;