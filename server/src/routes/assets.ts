import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Get all assets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, ac.name as class_name, ac.useful_life_years, ac.depreciation_rate,
             b.name as branch_name
      FROM assets a
      LEFT JOIN asset_classes ac ON a.asset_class_id = ac.id
      LEFT JOIN branches b ON a.branch_id = b.id
      ORDER BY a.purchase_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Run depreciation
router.post('/depreciate', async (req, res) => {
  try {
    const userId = (req as any).userId || 1;
    
    const assets = await pool.query(`
      SELECT a.*, ac.depreciation_rate, ac.useful_life_years
      FROM assets a
      JOIN asset_classes ac ON a.asset_class_id = ac.id
      WHERE a.status = 'active'
    `);

    let totalDepreciation = 0;

    for (const asset of assets.rows) {
      const annualDepreciation = (parseFloat(asset.purchase_cost) - parseFloat(asset.salvage_value)) / asset.useful_life_years;
      const monthlyDepreciation = annualDepreciation / 12;
      
      const newValue = parseFloat(asset.current_value) - monthlyDepreciation;
      totalDepreciation += monthlyDepreciation;

      await pool.query(
        'UPDATE assets SET current_value = $1 WHERE id = $2',
        [Math.max(newValue, parseFloat(asset.salvage_value)), asset.id]
      );

      // If fully depreciated, mark as disposed
      if (newValue <= parseFloat(asset.salvage_value)) {
        await pool.query("UPDATE assets SET status = 'fully_depreciated' WHERE id = $1", [asset.id]);
      }
    }

    // Create journal entry for depreciation
    if (totalDepreciation > 0) {
      const entryNumber = `DEP-${Date.now().toString().slice(-8)}`;
      const journal = await pool.query(
        `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
         VALUES ($1, $2, CURRENT_DATE, 'JUL-2026', 'posted', $3) RETURNING id`,
        [entryNumber, 'Monthly depreciation run', userId]
      );

      // Dr Depreciation Expense (5500)
      await pool.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 28, $2, $3, 0)',
        [journal.rows[0].id, 'Depreciation Expense', totalDepreciation]
      );

      // Cr Accumulated Depreciation (1202)
      await pool.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 8, $2, 0, $3)',
        [journal.rows[0].id, 'Accumulated Depreciation', totalDepreciation]
      );
    }

    res.json({ 
      message: `Depreciation run complete`, 
      total_depreciation: totalDepreciation,
      assets_processed: assets.rows.length 
    });

  } catch (error) {
    console.error('Depreciation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

import { z } from 'zod';

const assetSchema = z.object({
  name: z.string().min(1),
  asset_class_id: z.number().min(1),
  purchase_date: z.string().min(1),
  purchase_cost: z.number().positive(),
  salvage_value: z.number().min(0),
  location: z.string().optional(),
});

// Create asset
router.post('/', async (req, res) => {
  try {
    const validation = assetSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
      return;
    }

    const { name, asset_class_id, purchase_date, purchase_cost, salvage_value, location } = req.body;
    const code = `AST${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO assets (code, name, asset_class_id, purchase_date, purchase_cost, salvage_value, current_value, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [code, name, asset_class_id, purchase_date, purchase_cost, salvage_value, purchase_cost, location]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get asset classes
router.get('/classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM asset_classes ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
export default router;