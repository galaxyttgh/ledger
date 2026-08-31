import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all items
router.get('/items', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, c.name as category_name,
             COALESCE(sb.quantity, 0) as stock_qty,
             COALESCE(sb.avg_cost, i.cost_price) as avg_cost
      FROM items i
      LEFT JOIN item_categories c ON i.category_id = c.id
      LEFT JOIN stock_balances sb ON i.id = sb.item_id
      WHERE i.is_active = true
      ORDER BY i.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create item
router.post('/items', authMiddleware, async (req, res) => {
  try {
    const { name, category_id, unit, cost_price, selling_price, reorder_level } = req.body;
    const userId = (req as any).userId || 1;
    const code = `ITEM-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO items (code, name, category_id, unit, cost_price, selling_price, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [code, name, category_id, unit, cost_price || 0, selling_price || 0, reorder_level || 10]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get warehouses
router.get('/warehouses', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warehouses WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get categories
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM item_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Stock movement (receive, issue, transfer, adjust)
// router.post('/movements', authMiddleware, async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { item_id, warehouse_id, movement_type, quantity, unit_cost, reference, notes } = req.body;
//     const userId = (req as any).userId || 1;
//     const qty = parseInt(quantity);

//     await client.query('BEGIN');

//     // Record movement
//     await client.query(
//       `INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, unit_cost, reference, notes, created_by)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//       [item_id, warehouse_id, movement_type, qty, unit_cost || 0, reference, notes, userId]
//     );

//     // Update stock balance
//     let quantityDelta = qty;
//     if (movement_type === 'issue' || movement_type === 'return') {
//       quantityDelta = -qty;
//     }

//     await client.query(`
//       INSERT INTO stock_balances (item_id, warehouse_id, quantity, avg_cost)
//       VALUES ($1, $2, $3, $4)
//       ON CONFLICT (item_id, warehouse_id) 
//       DO UPDATE SET 
//         quantity = stock_balances.quantity + $3,
//         avg_cost = CASE WHEN stock_balances.quantity + $3 = 0 THEN stock_balances.avg_cost ELSE $4 END,
//         updated_at = NOW()
//     `, [item_id, warehouse_id, quantityDelta, unit_cost || 0]);

//     await client.query('COMMIT');
//     res.status(201).json({ message: 'Stock movement recorded' });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Movement error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// Stock movement with GL posting
router.post('/movements', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { item_id, warehouse_id, movement_type, quantity, unit_cost, reference, notes } = req.body;
    const userId = (req as any).userId || 1;
    const qty = parseInt(quantity);
    const cost = parseFloat(unit_cost) || 0;
    const totalCost = qty * cost;

    await client.query('BEGIN');

    // Record movement
    await client.query(
      `INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, unit_cost, reference, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [item_id, warehouse_id, movement_type, qty, cost, reference, notes, userId]
    );

    // Update stock balance
    let quantityDelta = qty;
    if (movement_type === 'issue' || movement_type === 'return') {
      quantityDelta = -qty;
    }

    await client.query(`
      INSERT INTO stock_balances (item_id, warehouse_id, quantity, avg_cost)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (item_id, warehouse_id) 
      DO UPDATE SET 
        quantity = stock_balances.quantity + $3,
        avg_cost = CASE WHEN stock_balances.quantity + $3 <= 0 THEN stock_balances.avg_cost 
                        ELSE ROUND(((stock_balances.quantity * stock_balances.avg_cost) + ($3 * $4)) / (stock_balances.quantity + $3), 2) END,
        updated_at = NOW()
    `, [item_id, warehouse_id, quantityDelta, cost]);

    // ============================================
    // POST TO GENERAL LEDGER
    // ============================================
    if (movement_type === 'receive' && totalCost > 0) {
      const entryNumber = `GRN-${Date.now().toString().slice(-8)}`;
      const journal = await client.query(
        `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
         VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
        [entryNumber, `Stock Received - ${reference || entryNumber}`, new Date().toISOString().substring(0, 7), userId]
      );

      // Dr Inventory Asset (1105)
      await client.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 31, $2, $3, 0, $4, $5, $6)',
        [journal.rows[0].id, 'Inventory Received', totalCost, 'inventory', item_id, entryNumber]
      );
      // Cr Accounts Payable (2101)
      await client.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 11, $2, 0, $3, $4, $5, $6)',
        [journal.rows[0].id, 'Stock Payable', totalCost, 'inventory', item_id, entryNumber]
      );
    }

    if (movement_type === 'issue' && totalCost > 0) {
      const entryNumber = `GIN-${Date.now().toString().slice(-8)}`;
      const journal = await client.query(
        `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
         VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
        [entryNumber, `Stock Issued - ${reference || entryNumber}`, new Date().toISOString().substring(0, 7), userId]
      );

      // Dr Cost of Goods Sold (4400)
      await client.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 32, $2, $3, 0, $4, $5, $6)',
        [journal.rows[0].id, 'COGS - Stock Issue', totalCost, 'inventory', item_id, entryNumber]
      );
      // Cr Inventory Asset (1105)
      await client.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 31, $2, 0, $3, $4, $5, $6)',
        [journal.rows[0].id, 'Inventory Reduction', totalCost, 'inventory', item_id, entryNumber]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Stock movement recorded and posted to GL' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Movement error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});


// Transfer stock between warehouses
router.post('/transfer', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { item_id, from_warehouse_id, to_warehouse_id, quantity, notes } = req.body;
    const userId = (req as any).userId || 1;
    const qty = parseInt(quantity);

    await client.query('BEGIN');

    // Remove from source
    await client.query(
      `INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, reference, notes, created_by)
       VALUES ($1, $2, 'transfer_out', $3, $4, $5, $6)`,
      [item_id, from_warehouse_id, -qty, `TRANSFER-${Date.now()}`, notes, userId]
    );

    // Add to destination
    await client.query(
      `INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, reference, notes, created_by)
       VALUES ($1, $2, 'transfer_in', $3, $4, $5, $6)`,
      [item_id, to_warehouse_id, qty, `TRANSFER-${Date.now()}`, notes, userId]
    );

    // Update balances
    await client.query(`
      UPDATE stock_balances SET quantity = quantity - $1, updated_at = NOW()
      WHERE item_id = $2 AND warehouse_id = $3
    `, [qty, item_id, from_warehouse_id]);

    await client.query(`
      INSERT INTO stock_balances (item_id, warehouse_id, quantity, avg_cost)
      VALUES ($1, $2, $3, (SELECT avg_cost FROM stock_balances WHERE item_id = $1 AND warehouse_id = $4 LIMIT 1))
      ON CONFLICT (item_id, warehouse_id) DO UPDATE SET quantity = stock_balances.quantity + $3
    `, [item_id, to_warehouse_id, qty, from_warehouse_id]);

    await client.query('COMMIT');
    res.json({ message: 'Stock transferred' });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});
// Get stock movements
router.get('/movements', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sm.*, i.name as item_name, w.name as warehouse_name, u.full_name as created_by_name
      FROM stock_movements sm
      JOIN items i ON sm.item_id = i.id
      JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN users u ON sm.created_by = u.id
      ORDER BY sm.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder alerts
router.get('/reorder-alerts', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, c.name as category_name, sb.quantity as stock_qty
      FROM items i
      LEFT JOIN item_categories c ON i.category_id = c.id
      LEFT JOIN stock_balances sb ON i.id = sb.item_id
      WHERE i.is_active = true 
        AND COALESCE(sb.quantity, 0) <= i.reorder_level
      ORDER BY COALESCE(sb.quantity, 0) ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;