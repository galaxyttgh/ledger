import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all POs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT po.*, s.name as supplier_name, u.full_name as created_by_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.created_by = u.id
      ORDER BY po.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create PO
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { supplier_id, po_date, expected_delivery, description, subtotal } = req.body;
    const userId = (req as any).userId || 1;
    const taxAmount = subtotal * 0.075;
    const total = subtotal + taxAmount;
    const poNumber = `PO-${Date.now().toString().slice(-8)}`;

    const result = await pool.query(
      `INSERT INTO purchase_orders (po_number, supplier_id, po_date, expected_delivery, description, subtotal, tax_amount, total, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'approved', $9) RETURNING *`,
      [poNumber, supplier_id, po_date, expected_delivery, description, subtotal, taxAmount, total, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create PO error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Goods Receipt
router.post('/goods-receipt', authMiddleware, async (req, res) => {
  try {
    const { po_id, receipt_date, quantity_received, notes } = req.body;
    const userId = (req as any).userId || 1;
    const grNumber = `GR-${Date.now().toString().slice(-8)}`;

    const result = await pool.query(
      `INSERT INTO goods_receipts (gr_number, po_id, receipt_date, quantity_received, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [grNumber, po_id, receipt_date, quantity_received, notes, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3-Way Match: Link PO → GR → Bill
router.post('/match', authMiddleware, async (req, res) => {
  try {
    const { po_id, gr_id, bill_id } = req.body;

    const po = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [po_id]);
    const gr = await pool.query('SELECT * FROM goods_receipts WHERE id = $1', [gr_id]);
    const bill = await pool.query('SELECT * FROM bills WHERE id = $1', [bill_id]);

    if (po.rows.length === 0 || gr.rows.length === 0 || bill.rows.length === 0) {
      res.status(404).json({ error: 'One or more records not found' });
      return;
    }

    const poAmount = parseFloat(po.rows[0].total);
    const billAmount = parseFloat(bill.rows[0].total);
    const variance = billAmount - poAmount;
    const matchStatus = Math.abs(variance) < 1 ? 'matched' : 'variance';

    const result = await pool.query(
      `INSERT INTO three_way_match (po_id, gr_id, bill_id, match_status, po_amount, gr_quantity, bill_amount, variance, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [po_id, gr_id, bill_id, matchStatus, poAmount, gr.rows[0].quantity_received, billAmount, variance,
       matchStatus === 'matched' ? 'All match' : `Variance: ₦${variance}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get 3-way match report
router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT twm.*, 
             po.po_number, s.name as supplier_name,
             gr.gr_number,
             b.bill_number
      FROM three_way_match twm
      JOIN purchase_orders po ON twm.po_id = po.id
      JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN goods_receipts gr ON twm.gr_id = gr.id
      LEFT JOIN bills b ON twm.bill_id = b.id
      ORDER BY twm.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;