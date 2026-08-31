// import express from 'express';
// import pool from '../db/pool.js';
// import { authMiddleware } from '../middleware/auth.js';

// const router = express.Router();

// // Get all items
// router.get('/items', authMiddleware, async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT i.*, c.name as category_name,
//              COALESCE(sb.quantity, 0) as stock_qty,
//              COALESCE(sb.avg_cost, i.cost_price) as avg_cost
//       FROM items i
//       LEFT JOIN item_categories c ON i.category_id = c.id
//       LEFT JOIN stock_balances sb ON i.id = sb.item_id
//       WHERE i.is_active = true
//       ORDER BY i.name
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get items error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Create item
// router.post('/items', authMiddleware, async (req, res) => {
//   try {
//     const { name, category_id, unit, cost_price, selling_price, reorder_level } = req.body;
//     const userId = (req as any).userId || 1;
//     const code = `ITEM-${Date.now().toString().slice(-6)}`;

//     const result = await pool.query(
//       `INSERT INTO items (code, name, category_id, unit, cost_price, selling_price, reorder_level)
//        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
//       [code, name, category_id, unit, cost_price || 0, selling_price || 0, reorder_level || 10]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('Create item error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get warehouses
// router.get('/warehouses', authMiddleware, async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM warehouses WHERE is_active = true ORDER BY name');
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get categories
// router.get('/categories', authMiddleware, async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM item_categories ORDER BY name');
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Stock movement (receive, issue, transfer, adjust)
// // router.post('/movements', authMiddleware, async (req, res) => {
// //   const client = await pool.connect();
// //   try {
// //     const { item_id, warehouse_id, movement_type, quantity, unit_cost, reference, notes } = req.body;
// //     const userId = (req as any).userId || 1;
// //     const qty = parseInt(quantity);

// //     await client.query('BEGIN');

// //     // Record movement
// //     await client.query(
// //       `INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, unit_cost, reference, notes, created_by)
// //        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
// //       [item_id, warehouse_id, movement_type, qty, unit_cost || 0, reference, notes, userId]
// //     );

// //     // Update stock balance
// //     let quantityDelta = qty;
// //     if (movement_type === 'issue' || movement_type === 'return') {
// //       quantityDelta = -qty;
// //     }

// //     await client.query(`
// //       INSERT INTO stock_balances (item_id, warehouse_id, quantity, avg_cost)
// //       VALUES ($1, $2, $3, $4)
// //       ON CONFLICT (item_id, warehouse_id) 
// //       DO UPDATE SET 
// //         quantity = stock_balances.quantity + $3,
// //         avg_cost = CASE WHEN stock_balances.quantity + $3 = 0 THEN stock_balances.avg_cost ELSE $4 END,
// //         updated_at = NOW()
// //     `, [item_id, warehouse_id, quantityDelta, unit_cost || 0]);

// //     await client.query('COMMIT');
// //     res.status(201).json({ message: 'Stock movement recorded' });

// //   } catch (error) {
// //     await client.query('ROLLBACK');
// //     console.error('Movement error:', error);
// //     res.status(500).json({ error: 'Server error' });
// //   } finally {
// //     client.release();
// //   }
// // });

// // Stock movement with GL posting
// router.post('/movements', authMiddleware, async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { item_id, warehouse_id, movement_type, quantity, unit_cost, reference, notes } = req.body;
//     const userId = (req as any).userId || 1;
//     const qty = parseInt(quantity);
//     const cost = parseFloat(unit_cost) || 0;
//     const totalCost = qty * cost;

//     await client.query('BEGIN');

//     // Record movement
//     await client.query(
//       `INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, unit_cost, reference, notes, created_by)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//       [item_id, warehouse_id, movement_type, qty, cost, reference, notes, userId]
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
//         avg_cost = CASE WHEN stock_balances.quantity + $3 <= 0 THEN stock_balances.avg_cost 
//                         ELSE ROUND(((stock_balances.quantity * stock_balances.avg_cost) + ($3 * $4)) / (stock_balances.quantity + $3), 2) END,
//         updated_at = NOW()
//     `, [item_id, warehouse_id, quantityDelta, cost]);

//     // ============================================
//     // POST TO GENERAL LEDGER
//     // ============================================
//     if (movement_type === 'receive' && totalCost > 0) {
//       const entryNumber = `GRN-${Date.now().toString().slice(-8)}`;
//       const journal = await client.query(
//         `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//          VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
//         [entryNumber, `Stock Received - ${reference || entryNumber}`, new Date().toISOString().substring(0, 7), userId]
//       );

//       // Dr Inventory Asset (1105)
//       await client.query(
//         'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 31, $2, $3, 0, $4, $5, $6)',
//         [journal.rows[0].id, 'Inventory Received', totalCost, 'inventory', item_id, entryNumber]
//       );
//       // Cr Accounts Payable (2101)
//       await client.query(
//         'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 11, $2, 0, $3, $4, $5, $6)',
//         [journal.rows[0].id, 'Stock Payable', totalCost, 'inventory', item_id, entryNumber]
//       );
//     }

//     if (movement_type === 'issue' && totalCost > 0) {
//       const entryNumber = `GIN-${Date.now().toString().slice(-8)}`;
//       const journal = await client.query(
//         `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//          VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
//         [entryNumber, `Stock Issued - ${reference || entryNumber}`, new Date().toISOString().substring(0, 7), userId]
//       );

//       // Dr Cost of Goods Sold (4400)
//       await client.query(
//         'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 32, $2, $3, 0, $4, $5, $6)',
//         [journal.rows[0].id, 'COGS - Stock Issue', totalCost, 'inventory', item_id, entryNumber]
//       );
//       // Cr Inventory Asset (1105)
//       await client.query(
//         'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 31, $2, 0, $3, $4, $5, $6)',
//         [journal.rows[0].id, 'Inventory Reduction', totalCost, 'inventory', item_id, entryNumber]
//       );
//     }

//     await client.query('COMMIT');
//     res.status(201).json({ message: 'Stock movement recorded and posted to GL' });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Movement error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });


// // Transfer stock between warehouses
// router.post('/transfer', authMiddleware, async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { item_id, from_warehouse_id, to_warehouse_id, quantity, notes } = req.body;
//     const userId = (req as any).userId || 1;
//     const qty = parseInt(quantity);

//     await client.query('BEGIN');

//     // Remove from source
//     await client.query(
//       `INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, reference, notes, created_by)
//        VALUES ($1, $2, 'transfer_out', $3, $4, $5, $6)`,
//       [item_id, from_warehouse_id, -qty, `TRANSFER-${Date.now()}`, notes, userId]
//     );

//     // Add to destination
//     await client.query(
//       `INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, reference, notes, created_by)
//        VALUES ($1, $2, 'transfer_in', $3, $4, $5, $6)`,
//       [item_id, to_warehouse_id, qty, `TRANSFER-${Date.now()}`, notes, userId]
//     );

//     // Update balances
//     await client.query(`
//       UPDATE stock_balances SET quantity = quantity - $1, updated_at = NOW()
//       WHERE item_id = $2 AND warehouse_id = $3
//     `, [qty, item_id, from_warehouse_id]);

//     await client.query(`
//       INSERT INTO stock_balances (item_id, warehouse_id, quantity, avg_cost)
//       VALUES ($1, $2, $3, (SELECT avg_cost FROM stock_balances WHERE item_id = $1 AND warehouse_id = $4 LIMIT 1))
//       ON CONFLICT (item_id, warehouse_id) DO UPDATE SET quantity = stock_balances.quantity + $3
//     `, [item_id, to_warehouse_id, qty, from_warehouse_id]);

//     await client.query('COMMIT');
//     res.json({ message: 'Stock transferred' });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });
// // Get stock movements
// router.get('/movements', authMiddleware, async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT sm.*, i.name as item_name, w.name as warehouse_name, u.full_name as created_by_name
//       FROM stock_movements sm
//       JOIN items i ON sm.item_id = i.id
//       JOIN warehouses w ON sm.warehouse_id = w.id
//       LEFT JOIN users u ON sm.created_by = u.id
//       ORDER BY sm.created_at DESC
//       LIMIT 100
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Reorder alerts
// router.get('/reorder-alerts', authMiddleware, async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT i.*, c.name as category_name, sb.quantity as stock_qty
//       FROM items i
//       LEFT JOIN item_categories c ON i.category_id = c.id
//       LEFT JOIN stock_balances sb ON i.id = sb.item_id
//       WHERE i.is_active = true 
//         AND COALESCE(sb.quantity, 0) <= i.reorder_level
//       ORDER BY COALESCE(sb.quantity, 0) ASC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// export default router;

import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
import { periodGuard } from '../middleware/period.js';

const router = express.Router();

// ============================================
// HELPER FUNCTIONS
// ============================================

const calculateWeightedAverage = (currentQty: number, currentAvg: number, newQty: number, newCost: number): number => {
  if (currentQty + newQty === 0) return currentAvg || 0;
  return ((currentQty * currentAvg) + (newQty * newCost)) / (currentQty + newQty);
};

const createAuditLog = async (client: any, userId: number, action: string, tableName: string, recordId: number, data: any) => {
  await client.query(
    `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [userId, action, tableName, recordId, JSON.stringify(data)]
  );
};

// ============================================
// ITEMS
// ============================================

// Get all items
router.get('/items', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.*, 
        c.name as category_name,
        COALESCE(SUM(sb.quantity), 0) as stock_qty,
        COALESCE(AVG(sb.avg_cost), i.cost_price) as avg_cost,
        COUNT(DISTINCT sb.warehouse_id) as warehouse_count
      FROM items i
      LEFT JOIN item_categories c ON i.category_id = c.id
      LEFT JOIN stock_balances sb ON i.id = sb.item_id
      WHERE i.is_active = true
      GROUP BY i.id, c.name
      ORDER BY i.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single item
router.get('/items/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, c.name as category_name
      FROM items i
      LEFT JOIN item_categories c ON i.category_id = c.id
      WHERE i.id = $1 AND i.is_active = true
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get stock by warehouse
    const stock = await pool.query(`
      SELECT 
        w.id as warehouse_id,
        w.name as warehouse_name,
        sb.quantity,
        sb.avg_cost,
        (sb.quantity * sb.avg_cost) as total_value
      FROM stock_balances sb
      JOIN warehouses w ON sb.warehouse_id = w.id
      WHERE sb.item_id = $1 AND sb.quantity > 0
    `, [req.params.id]);

    // Get recent movements
    const movements = await pool.query(`
      SELECT 
        movement_type,
        quantity,
        unit_cost,
        reference,
        created_at
      FROM stock_movements
      WHERE item_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [req.params.id]);

    res.json({
      ...result.rows[0],
      stock_by_warehouse: stock.rows,
      recent_movements: movements.rows
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create item with duplicate check
router.post('/items', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      name, category_id, unit, cost_price, selling_price, 
      reorder_level, reorder_quantity 
    } = req.body;
    const userId = (req as any).userId || 1;
    const code = `ITEM-${Date.now().toString().slice(-6)}`;

    // Check for duplicate
    const duplicate = await client.query(
      'SELECT id FROM items WHERE name ILIKE $1 AND is_active = true',
      [name.trim()]
    );

    if (duplicate.rows.length > 0) {
      return res.status(400).json({ error: 'Item with this name already exists' });
    }

    const result = await client.query(`
      INSERT INTO items (
        code, name, category_id, unit, cost_price, selling_price, 
        reorder_level, reorder_quantity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      code, name.trim(), category_id || null, unit || 'piece', 
      parseFloat(cost_price) || 0, parseFloat(selling_price) || 0,
      parseInt(reorder_level) || 10, parseInt(reorder_quantity) || 0
    ]);

    await createAuditLog(client, userId, 'CREATE', 'items', result.rows[0].id, result.rows[0]);

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Update item
router.put('/items/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      name, category_id, unit, cost_price, selling_price, 
      reorder_level, reorder_quantity, is_active 
    } = req.body;
    const userId = (req as any).userId || 1;

    const result = await client.query(`
      UPDATE items SET
        name = $1, category_id = $2, unit = $3,
        cost_price = $4, selling_price = $5,
        reorder_level = $6, reorder_quantity = $7,
        is_active = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `, [
      name, category_id, unit, 
      parseFloat(cost_price) || 0, parseFloat(selling_price) || 0,
      parseInt(reorder_level) || 10, parseInt(reorder_quantity) || 0,
      is_active, req.params.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await createAuditLog(client, userId, 'UPDATE', 'items', result.rows[0].id, result.rows[0]);

    await client.query('COMMIT');
    res.json(result.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Delete item (soft delete)
router.delete('/items/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = (req as any).userId || 1;

    // Check if item has stock
    const stock = await client.query(
      'SELECT quantity FROM stock_balances WHERE item_id = $1 AND quantity > 0',
      [req.params.id]
    );

    if (stock.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete item with stock. Deactivate instead.' });
    }

    const result = await client.query(
      'UPDATE items SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await createAuditLog(client, userId, 'DELETE', 'items', result.rows[0].id, { is_active: false });

    await client.query('COMMIT');
    res.json({ message: 'Item deactivated' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// ============================================
// CATEGORIES
// ============================================

router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(i.id) as item_count
      FROM item_categories c
      LEFT JOIN items i ON c.id = i.category_id AND i.is_active = true
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/categories', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO item_categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// WAREHOUSES
// ============================================

router.get('/warehouses', authMiddleware, async (req, res) => {
  try {
    const { branch_id } = req.query;
    let query = `
      SELECT w.*, b.name as branch_name,
             COUNT(DISTINCT sb.item_id) as item_count,
             COALESCE(SUM(sb.quantity), 0) as total_items
      FROM warehouses w
      LEFT JOIN branches b ON w.branch_id = b.id
      LEFT JOIN stock_balances sb ON w.id = sb.warehouse_id
      WHERE w.is_active = true
    `;
    const params = [];

    if (branch_id) {
      params.push(branch_id);
      query += ` AND w.branch_id = $${params.length}`;
    }

    query += ` GROUP BY w.id, b.name ORDER BY w.name`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/warehouses', authMiddleware, async (req, res) => {
  try {
    const { name, branch_id, location } = req.body;
    const code = `WH-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO warehouses (name, code, branch_id, location) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, code, branch_id, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// STOCK MOVEMENTS
// ============================================

// Receive stock
router.post('/receive', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
    const { item_id, warehouse_id, quantity, unit_cost, reference, notes } = req.body;
    const userId = (req as any).userId || 1;
    const period = (req as any).period || new Date().toISOString().substring(0, 7);
    const qty = parseFloat(quantity);
    const cost = parseFloat(unit_cost) || 0;
    const totalCost = qty * cost;
    const movementNumber = `RCP-${Date.now().toString().slice(-8)}`;

    // Validate item exists
    const itemCheck = await client.query(
      'SELECT * FROM items WHERE id = $1 AND is_active = true',
      [item_id]
    );
    if (itemCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Item not found or inactive' });
    }

    await client.query('BEGIN');

    // Get current balance for weighted average
    const currentBalance = await client.query(
      'SELECT quantity, avg_cost FROM stock_balances WHERE item_id = $1 AND warehouse_id = $2',
      [item_id, warehouse_id]
    );

    let currentQty = 0;
    let currentAvg = 0;
    if (currentBalance.rows.length > 0) {
      currentQty = parseFloat(currentBalance.rows[0].quantity);
      currentAvg = parseFloat(currentBalance.rows[0].avg_cost);
    }

    // Calculate new weighted average
    const newAvg = calculateWeightedAverage(currentQty, currentAvg, qty, cost);

    // Record movement
    const movement = await client.query(`
      INSERT INTO stock_movements (
        movement_number, item_id, warehouse_id, movement_type, 
        quantity, unit_cost, total_cost, reference, notes, created_by
      ) VALUES ($1, $2, $3, 'receive', $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [movementNumber, item_id, warehouse_id, qty, cost, totalCost, reference, notes, userId]);

    // Update stock balance
    await client.query(`
      INSERT INTO stock_balances (item_id, warehouse_id, quantity, avg_cost)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (item_id, warehouse_id) DO UPDATE SET
        quantity = stock_balances.quantity + $3,
        avg_cost = $4,
        updated_at = NOW()
    `, [item_id, warehouse_id, qty, newAvg]);

    // CREATE JOURNAL ENTRY
    const entryNumber = `STK-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4)
      RETURNING id
    `, [entryNumber, `Stock Receive - ${movementNumber}`, period, userId]);

    const journalId = journal.rows[0].id;

    // Dr Inventory Asset (1105)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 31, $2, $3, 0, 'inventory', $4, $5)
    `, [journalId, `Stock Receive - ${movementNumber}`, totalCost, movement.rows[0].id, movementNumber]);

    // Cr Accounts Payable (11)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 11, $2, 0, $3, 'inventory', $4, $5)
    `, [journalId, `Stock Payable - ${movementNumber}`, totalCost, movement.rows[0].id, movementNumber]);

    // Link journal to movement
    await client.query(
      'UPDATE stock_movements SET journal_entry_id = $1 WHERE id = $2',
      [journalId, movement.rows[0].id]
    );

    // Subledger reference
    await client.query(`
      INSERT INTO subledger_references (
        source_type, source_id, journal_entry_id, transaction_date, amount
      ) VALUES ($1, $2, $3, CURRENT_DATE, $4)
    `, ['inventory', movement.rows[0].id, journalId, totalCost]);

    // Audit log
    await createAuditLog(client, userId, 'STOCK_RECEIVE', 'stock_movements', movement.rows[0].id, {
      movement_number: movementNumber,
      item_id,
      warehouse_id,
      quantity: qty,
      unit_cost: cost,
      total_cost: totalCost
    });

    await client.query('COMMIT');

    res.status(201).json({
      ...movement.rows[0],
      journal_entry: entryNumber,
      journal_id: journalId,
      new_average_cost: newAvg,
      total_cost: totalCost
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Receive stock error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Issue stock
router.post('/issue', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
    const { item_id, warehouse_id, quantity, unit_cost, reference, notes } = req.body;
    const userId = (req as any).userId || 1;
    const period = (req as any).period || new Date().toISOString().substring(0, 7);
    const qty = parseFloat(quantity);
    const movementNumber = `ISS-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Check stock availability
    const balance = await client.query(
      'SELECT quantity, avg_cost FROM stock_balances WHERE item_id = $1 AND warehouse_id = $2',
      [item_id, warehouse_id]
    );

    if (balance.rows.length === 0 || parseFloat(balance.rows[0].quantity) < qty) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: balance.rows.length > 0 ? parseFloat(balance.rows[0].quantity) : 0,
        requested: qty
      });
    }

    const avgCost = parseFloat(balance.rows[0].avg_cost) || 0;
    const cost = parseFloat(unit_cost) || avgCost;
    const totalCost = qty * cost;

    // Record movement
    const movement = await client.query(`
      INSERT INTO stock_movements (
        movement_number, item_id, warehouse_id, movement_type, 
        quantity, unit_cost, total_cost, reference, notes, created_by
      ) VALUES ($1, $2, $3, 'issue', $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [movementNumber, item_id, warehouse_id, qty, cost, totalCost, reference, notes, userId]);

    // Update stock balance
    await client.query(`
      UPDATE stock_balances 
      SET quantity = quantity - $1, updated_at = NOW()
      WHERE item_id = $2 AND warehouse_id = $3
    `, [qty, item_id, warehouse_id]);

    // CREATE JOURNAL ENTRY
    const entryNumber = `STK-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4)
      RETURNING id
    `, [entryNumber, `Stock Issue - ${movementNumber}`, period, userId]);

    const journalId = journal.rows[0].id;

    // Dr Cost of Goods Sold (4400)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 32, $2, $3, 0, 'inventory', $4, $5)
    `, [journalId, `COGS - ${movementNumber}`, totalCost, movement.rows[0].id, movementNumber]);

    // Cr Inventory Asset (1105)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 31, $2, 0, $3, 'inventory', $4, $5)
    `, [journalId, `Inventory Reduction - ${movementNumber}`, totalCost, movement.rows[0].id, movementNumber]);

    // Link journal to movement
    await client.query(
      'UPDATE stock_movements SET journal_entry_id = $1 WHERE id = $2',
      [journalId, movement.rows[0].id]
    );

    // Subledger reference
    await client.query(`
      INSERT INTO subledger_references (
        source_type, source_id, journal_entry_id, transaction_date, amount
      ) VALUES ($1, $2, $3, CURRENT_DATE, $4)
    `, ['inventory', movement.rows[0].id, journalId, totalCost]);

    // Audit log
    await createAuditLog(client, userId, 'STOCK_ISSUE', 'stock_movements', movement.rows[0].id, {
      movement_number: movementNumber,
      item_id,
      warehouse_id,
      quantity: qty,
      unit_cost: cost,
      total_cost: totalCost
    });

    await client.query('COMMIT');

    // Check reorder level
    const newBalance = await client.query(
      'SELECT quantity FROM stock_balances WHERE item_id = $1 AND warehouse_id = $2',
      [item_id, warehouse_id]
    );

    const currentQty = newBalance.rows.length > 0 ? parseFloat(newBalance.rows[0].quantity) : 0;

    // Get reorder level
    const item = await client.query(
      'SELECT reorder_level FROM items WHERE id = $1',
      [item_id]
    );

    let reorderAlert = null;
    if (item.rows.length > 0 && currentQty <= item.rows[0].reorder_level) {
      // Create reorder alert
      const alert = await client.query(`
        INSERT INTO reorder_alerts (item_id, warehouse_id, current_quantity, reorder_level)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [item_id, warehouse_id, currentQty, item.rows[0].reorder_level]);
      reorderAlert = alert.rows[0];
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...movement.rows[0],
      journal_entry: entryNumber,
      journal_id: journalId,
      total_cost: totalCost,
      remaining_stock: currentQty,
      reorder_alert: reorderAlert
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Issue stock error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Transfer stock
// router.post('/transfer', authMiddleware, async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { item_id, from_warehouse_id, to_warehouse_id, quantity, notes } = req.body;
//     const userId = (req as any).userId || 1;
//     const qty = parseFloat(quantity);
//     const movementNumber = `TRF-${Date.now().toString().slice(-8)}`;

//     await client.query('BEGIN');

//     // Check source warehouse stock
//     const sourceBalance = await client.query(
//       'SELECT quantity, avg_cost FROM stock_balances WHERE item_id = $1 AND warehouse_id = $2',
//       [item_id, from_warehouse_id]
//     );

//     if (sourceBalance.rows.length === 0 || parseFloat(sourceBalance.rows[0].quantity) < qty) {
//       return res.status(400).json({ 
//         error: 'Insufficient stock in source warehouse',
//         available: sourceBalance.rows.length > 0 ? parseFloat(sourceBalance.rows[0].quantity) : 0
//       });
//     }

//     const avgCost = parseFloat(sourceBalance.rows[0].avg_cost) || 0;
//     const totalCost = qty * avgCost;

//     // Check destination warehouse exists
//     const destCheck = await client.query(
//       'SELECT id FROM warehouses WHERE id = $1 AND is_active = true',
//       [to_warehouse_id]
//     );

//     if (destCheck.rows.length === 0) {
//       return res.status(400).json({ error: 'Destination warehouse not found' });
//     }

//     // Record transfer out
//     await client.query(`
//       INSERT INTO stock_movements (
//         movement_number, item_id, warehouse_id, movement_type, 
//         quantity, unit_cost, total_cost, source_warehouse_id, 
//         destination_warehouse_id, notes, created_by
//       ) VALUES ($1, $2, $3, 'transfer_out', $4, $5, $6, $7, $8, $9, $10)
//     `, [movementNumber, item_id, from_warehouse_id, -qty, avgCost, totalCost, from_warehouse_id, to_warehouse_id, notes, userId]);

//     // Record transfer in
//     await client.query(`
//       INSERT INTO stock_movements (
//         movement_number, item_id, warehouse_id, movement_type, 
//         quantity, unit_cost, total_cost, source_warehouse_id, 
//         destination_warehouse_id, notes, created_by
//       ) VALUES ($1, $2, $3, 'transfer_in', $4, $5, $6, $7, $8, $9, $10)
//     `, [movementNumber, item_id, to_warehouse_id, qty, avgCost, totalCost, from_warehouse_id, to_warehouse_id, notes, userId]);

//     // Remove from source
//     await client.query(`
//       UPDATE stock_balances 
//       SET quantity = quantity - $1, updated_at = NOW()
//       WHERE item_id = $2 AND warehouse_id = $3
//     `, [qty, item_id, from_warehouse_id]);

//     // Add to destination
//     await client.query(`
//       INSERT INTO stock_balances (item_id, warehouse_id, quantity, avg_cost)
//       VALUES ($1, $2, $3, $4)
//       ON CONFLICT (item_id, warehouse_id) DO UPDATE SET
//         quantity = stock_balances.quantity + $3,
//         avg_cost = CASE 
//           WHEN stock_balances.quantity + $3 = 0 THEN stock_balances.avg_cost
//           ELSE ((stock_balances.avg_cost * stock_balances.quantity) + ($4 * $3)) / (stock_balances.quantity + $3)
//         END,
//         updated_at = NOW()
//     `, [item_id, to_warehouse_id, qty, avgCost]);

//     // Audit log
//     await createAuditLog(client, userId, 'STOCK_TRANSFER', 'stock_movements', null, {
//       movement_number: movementNumber,
//       item_id,
//       from_warehouse_id,
//       to_warehouse_id,
//       quantity: qty
//     });

//     await client.query('COMMIT');

//     res.json({
//       message: 'Stock transferred successfully',
//       movement_number: movementNumber,
//       item_id,
//       from_warehouse_id,
//       to_warehouse_id,
//       quantity: qty,
//       unit_cost: avgCost,
//       total_cost: totalCost
//     });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Transfer stock error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// Transfer stock between warehouses
router.post('/transfer', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { item_id, from_warehouse_id, to_warehouse_id, quantity, notes } = req.body;
    const userId = (req as any).userId || 1;
    const qty = parseFloat(quantity);
    const movementNumber = `TRF-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Check source warehouse stock
    const sourceBalance = await client.query(
      'SELECT quantity, avg_cost FROM stock_balances WHERE item_id = $1 AND warehouse_id = $2',
      [item_id, from_warehouse_id]
    );

    if (sourceBalance.rows.length === 0 || parseFloat(sourceBalance.rows[0].quantity) < qty) {
      return res.status(400).json({ 
        error: 'Insufficient stock in source warehouse',
        available: sourceBalance.rows.length > 0 ? parseFloat(sourceBalance.rows[0].quantity) : 0
      });
    }

    const avgCost = parseFloat(sourceBalance.rows[0].avg_cost) || 0;
    const totalCost = qty * avgCost;

    // Check destination warehouse exists
    const destCheck = await client.query(
      'SELECT id FROM warehouses WHERE id = $1 AND is_active = true',
      [to_warehouse_id]
    );

    if (destCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Destination warehouse not found' });
    }

    // Record transfer out - GET THE ID BACK
    const transferOut = await client.query(`
      INSERT INTO stock_movements (
        movement_number, item_id, warehouse_id, movement_type, 
        quantity, unit_cost, total_cost, source_warehouse_id, 
        destination_warehouse_id, notes, created_by
      ) VALUES ($1, $2, $3, 'transfer_out', $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [movementNumber, item_id, from_warehouse_id, -qty, avgCost, totalCost, from_warehouse_id, to_warehouse_id, notes, userId]);

    // Record transfer in - GET THE ID BACK
    const transferIn = await client.query(`
      INSERT INTO stock_movements (
        movement_number, item_id, warehouse_id, movement_type, 
        quantity, unit_cost, total_cost, source_warehouse_id, 
        destination_warehouse_id, notes, created_by
      ) VALUES ($1, $2, $3, 'transfer_in', $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [movementNumber, item_id, to_warehouse_id, qty, avgCost, totalCost, from_warehouse_id, to_warehouse_id, notes, userId]);

    // Remove from source
    await client.query(`
      UPDATE stock_balances 
      SET quantity = quantity - $1, updated_at = NOW()
      WHERE item_id = $2 AND warehouse_id = $3
    `, [qty, item_id, from_warehouse_id]);

    // Add to destination
    await client.query(`
      INSERT INTO stock_balances (item_id, warehouse_id, quantity, avg_cost)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (item_id, warehouse_id) DO UPDATE SET
        quantity = stock_balances.quantity + $3,
        avg_cost = CASE 
          WHEN stock_balances.quantity + $3 = 0 THEN stock_balances.avg_cost
          ELSE ((stock_balances.avg_cost * stock_balances.quantity) + ($4 * $3)) / (stock_balances.quantity + $3)
        END,
        updated_at = NOW()
    `, [item_id, to_warehouse_id, qty, avgCost]);

    // FIXED: Audit log with valid ID from transfer_out (NOT null)
    await createAuditLog(client, userId, 'STOCK_TRANSFER', 'stock_movements', transferOut.rows[0].id, {
      movement_number: movementNumber,
      item_id,
      from_warehouse_id,
      to_warehouse_id,
      quantity: qty,
      unit_cost: avgCost,
      total_cost: totalCost,
      transfer_out_id: transferOut.rows[0].id,
      transfer_in_id: transferIn.rows[0].id
    });

    await client.query('COMMIT');

    res.json({
      message: 'Stock transferred successfully',
      movement_number: movementNumber,
      item_id,
      from_warehouse_id,
      to_warehouse_id,
      quantity: qty,
      unit_cost: avgCost,
      total_cost: totalCost,
      transfer_out_id: transferOut.rows[0].id,
      transfer_in_id: transferIn.rows[0].id
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transfer stock error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});
// Adjust stock
router.post('/adjust', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
    const { item_id, warehouse_id, quantity, reason } = req.body;
    const userId = (req as any).userId || 1;
    const qty = parseFloat(quantity);
    const movementNumber = `ADJ-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Get current avg cost
    const balance = await client.query(
      'SELECT avg_cost FROM stock_balances WHERE item_id = $1 AND warehouse_id = $2',
      [item_id, warehouse_id]
    );

    const avgCost = balance.rows.length > 0 ? parseFloat(balance.rows[0].avg_cost) : 0;
    const totalCost = qty * avgCost;

    // Record movement
    const movement = await client.query(`
      INSERT INTO stock_movements (
        movement_number, item_id, warehouse_id, movement_type, 
        quantity, unit_cost, total_cost, notes, created_by
      ) VALUES ($1, $2, $3, 'adjust', $4, $5, $6, $7, $8)
      RETURNING *
    `, [movementNumber, item_id, warehouse_id, qty, avgCost, totalCost, reason || 'Manual adjustment', userId]);

    // Update stock balance
    await client.query(`
      INSERT INTO stock_balances (item_id, warehouse_id, quantity, avg_cost)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (item_id, warehouse_id) DO UPDATE SET
        quantity = stock_balances.quantity + $3,
        avg_cost = CASE 
          WHEN stock_balances.quantity + $3 = 0 THEN stock_balances.avg_cost
          ELSE ((stock_balances.avg_cost * stock_balances.quantity) + ($4 * $3)) / (stock_balances.quantity + $3)
        END,
        updated_at = NOW()
    `, [item_id, warehouse_id, qty, avgCost]);

    // Audit log
    await createAuditLog(client, userId, 'STOCK_ADJUST', 'stock_movements', movement.rows[0].id, {
      movement_number: movementNumber,
      item_id,
      warehouse_id,
      quantity: qty,
      reason
    });

    await client.query('COMMIT');

    res.json({
      ...movement.rows[0],
      message: 'Stock adjusted successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Adjust stock error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// ============================================
// GET MOVEMENTS
// ============================================

router.get('/movements', authMiddleware, async (req, res) => {
  try {
    const { item_id, warehouse_id, from_date, to_date, limit } = req.query;
    let query = `
      SELECT 
        sm.*, 
        i.name as item_name, i.code as item_code,
        w.name as warehouse_name, 
        u.full_name as created_by_name,
        sw.name as source_warehouse, 
        dw.name as dest_warehouse,
        je.entry_number as journal_entry,
        TO_CHAR(sm.created_at, 'YYYY-MM-DD HH24:MI') as formatted_date
      FROM stock_movements sm
      JOIN items i ON sm.item_id = i.id
      JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN users u ON sm.created_by = u.id
      LEFT JOIN warehouses sw ON sm.source_warehouse_id = sw.id
      LEFT JOIN warehouses dw ON sm.destination_warehouse_id = dw.id
      LEFT JOIN journal_entries je ON sm.journal_entry_id = je.id
      WHERE 1=1
    `;
    const params = [];

    if (item_id) {
      params.push(item_id);
      query += ` AND sm.item_id = $${params.length}`;
    }
    if (warehouse_id) {
      params.push(warehouse_id);
      query += ` AND sm.warehouse_id = $${params.length}`;
    }
    if (from_date) {
      params.push(from_date);
      query += ` AND sm.created_at >= $${params.length}`;
    }
    if (to_date) {
      params.push(to_date);
      query += ` AND sm.created_at <= $${params.length}`;
    }

    query += ` ORDER BY sm.created_at DESC`;
    if (limit) {
      params.push(parseInt(limit as string));
      query += ` LIMIT $${params.length}`;
    } else {
      query += ` LIMIT 100`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// STOCK BALANCES
// ============================================

router.get('/balances', authMiddleware, async (req, res) => {
  try {
    const { warehouse_id, category_id } = req.query;
    let query = `
      SELECT 
        sb.*, 
        i.code as item_code, i.name as item_name, 
        i.unit, i.cost_price, i.selling_price,
        i.reorder_level,
        w.name as warehouse_name,
        c.name as category_name,
        (sb.quantity * sb.avg_cost) as total_value
      FROM stock_balances sb
      JOIN items i ON sb.item_id = i.id
      JOIN warehouses w ON sb.warehouse_id = w.id
      LEFT JOIN item_categories c ON i.category_id = c.id
      WHERE i.is_active = true
    `;

    if (warehouse_id) {
      query += ` AND sb.warehouse_id = ${warehouse_id}`;
    }
    if (category_id) {
      query += ` AND i.category_id = ${category_id}`;
    }

    query += ` ORDER BY i.name`;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// REORDER ALERTS
// ============================================

router.get('/reorder-alerts', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ra.*,
        i.code as item_code, i.name as item_name, i.unit,
        w.name as warehouse_name,
        (i.reorder_level - ra.current_quantity) as shortage
      FROM reorder_alerts ra
      JOIN items i ON ra.item_id = i.id
      JOIN warehouses w ON ra.warehouse_id = w.id
      WHERE ra.status = 'pending'
      ORDER BY shortage DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get reorder alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve reorder alert
router.put('/reorder-alerts/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE reorder_alerts 
      SET status = 'resolved', resolved_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert resolved', alert: result.rows[0] });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// REPORTS
// ============================================

// Stock valuation report
router.get('/reports/valuation', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.id, i.code, i.name, i.unit,
        c.name as category_name,
        COALESCE(SUM(sb.quantity), 0) as total_quantity,
        COALESCE(AVG(sb.avg_cost), i.cost_price) as avg_cost,
        COALESCE(SUM(sb.quantity * sb.avg_cost), 0) as total_value
      FROM items i
      LEFT JOIN item_categories c ON i.category_id = c.id
      LEFT JOIN stock_balances sb ON i.id = sb.item_id
      WHERE i.is_active = true
      GROUP BY i.id, c.name
      ORDER BY total_value DESC
    `);

    const total = result.rows.reduce((sum, r) => sum + parseFloat(r.total_value || 0), 0);

    res.json({
      items: result.rows.filter(r => parseFloat(r.total_quantity) > 0),
      summary: {
        total_items: result.rows.length,
        total_quantity: result.rows.reduce((sum, r) => sum + parseFloat(r.total_quantity), 0),
        total_value: total
      }
    });
  } catch (error) {
    console.error('Valuation report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Stock summary (dashboard)
router.get('/reports/summary', authMiddleware, async (req, res) => {
  try {
    const totalItems = await pool.query('SELECT COUNT(*) as count FROM items WHERE is_active = true');
    const totalStock = await pool.query('SELECT COALESCE(SUM(quantity), 0) as total FROM stock_balances');
    const totalValue = await pool.query(`
      SELECT COALESCE(SUM(quantity * avg_cost), 0) as value FROM stock_balances
    `);
    const lowStock = await pool.query(`
      SELECT COUNT(*) as count FROM items i
      LEFT JOIN stock_balances sb ON i.id = sb.item_id
      WHERE i.is_active = true 
        AND i.reorder_level > 0 
        AND COALESCE(sb.quantity, 0) <= i.reorder_level
    `);
    const movements = await pool.query(`
      SELECT COUNT(*) as count FROM stock_movements 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);
    const recentReceives = await pool.query(`
      SELECT COUNT(*) as count FROM stock_movements 
      WHERE movement_type = 'receive' 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);
    const recentIssues = await pool.query(`
      SELECT COUNT(*) as count FROM stock_movements 
      WHERE movement_type = 'issue' 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);

    res.json({
      total_items: parseInt(totalItems.rows[0].count),
      total_stock: parseFloat(totalStock.rows[0].total),
      total_value: parseFloat(totalValue.rows[0].value),
      low_stock_items: parseInt(lowStock.rows[0].count),
      movements_30_days: parseInt(movements.rows[0].count),
      receives_30_days: parseInt(recentReceives.rows[0].count),
      issues_30_days: parseInt(recentIssues.rows[0].count)
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;