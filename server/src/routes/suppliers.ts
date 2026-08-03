import express from 'express';
import pool from '../db/pool.js';
import { z } from 'zod';

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  tax_id: z.string().optional().or(z.literal('')),
  payment_terms: z.number().optional(),
});

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
    const validation = supplierSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
      return;
    }

  const { name, email, phone, address, tax_id, payment_terms } = req.body;
const userId = (req as any).userId || 1;
const code = `SUPP-${Date.now().toString().slice(-6)}`;

const result = await pool.query(
  `INSERT INTO suppliers (code, name, email, phone, address, tax_id, payment_terms) 
   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
  [code, name, email, phone, address, tax_id || null, payment_terms || 30]
);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'CREATE', 'suppliers', $2, $3)`,
      [userId, result.rows[0].id, JSON.stringify(result.rows[0])]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const hasBills = await pool.query('SELECT COUNT(*) FROM bills WHERE supplier_id = $1', [req.params.id]);
    const hasPayments = await pool.query('SELECT COUNT(*) FROM payments WHERE supplier_id = $1', [req.params.id]);
    if (parseInt(hasBills.rows[0].count) > 0 || parseInt(hasPayments.rows[0].count) > 0) {
      res.status(400).json({ error: 'Cannot delete supplier with transactions.' });
      return;
    }
    await pool.query('DELETE FROM suppliers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;