import express from 'express';
import pool from '../db/pool.js';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  tax_id: z.string().optional().or(z.literal('')),
  credit_limit: z.number().optional(),
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

    const { name, email, phone, address, tax_id, credit_limit } = req.body;
const userId = (req as any).userId || 1;
const code = `CUST-${Date.now().toString().slice(-6)}`;

const result = await pool.query(
  `INSERT INTO customers (code, name, email, phone, address, tax_id, credit_limit) 
   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
  [code, name, email, phone, address, tax_id || null, credit_limit || 0]
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

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    // Check if customer has transactions
    const hasInvoices = await pool.query('SELECT COUNT(*) FROM invoices WHERE customer_id = $1', [req.params.id]);
    const hasReceipts = await pool.query('SELECT COUNT(*) FROM receipts WHERE customer_id = $1', [req.params.id]);
    
    if (parseInt(hasInvoices.rows[0].count) > 0 || parseInt(hasReceipts.rows[0].count) > 0) {
      res.status(400).json({ error: 'Cannot delete customer with transactions. Clear invoices and receipts first.' });
      return;
    }

    await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;