
import express from 'express';
import pool from '../db/pool.js';
import { z } from 'zod';
import { periodGuard } from '../middleware/period.js';

const router = express.Router();

// ============================================
// DEPRECIATION ENGINE
// ============================================

const calculateDepreciation = (asset: any, months: number = 1) => {
  const cost = parseFloat(asset.purchase_cost);
  const salvage = parseFloat(asset.salvage_value) || 0;
  const usefulLife = asset.useful_life_years || 5;
  const method = asset.depreciation_method || 'straight_line';

  let monthlyDepreciation = 0;
  let annualDepreciation = 0;

  if (method === 'straight_line') {
    annualDepreciation = (cost - salvage) / usefulLife;
    monthlyDepreciation = annualDepreciation / 12;
  } else if (method === 'reducing_balance') {
    const rate = 1 - Math.pow(salvage / cost, 1 / usefulLife);
    const currentValue = parseFloat(asset.current_value) || cost;
    annualDepreciation = currentValue * rate;
    monthlyDepreciation = annualDepreciation / 12;
  }

  const depreciationAmount = monthlyDepreciation * months;
  const newValue = Math.max(parseFloat(asset.current_value) - depreciationAmount, salvage);
  const isFullyDepreciated = newValue <= salvage;

  return {
    depreciationAmount,
    newValue,
    isFullyDepreciated,
    method,
    usefulLife
  };
};

// ============================================
// ROUTES
// ============================================

// Get all assets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, 
             ac.name as class_name, 
             ac.useful_life_years, 
             ac.depreciation_rate,
             ac.depreciation_method,
             b.name as branch_name
      FROM assets a
      LEFT JOIN asset_classes ac ON a.asset_class_id = ac.id
      LEFT JOIN branches b ON a.branch_id = b.id
      ORDER BY a.purchase_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get assets error:', error);
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


// Create asset class
router.post('/classes', async (req, res) => {
  try {
    const { name, useful_life_years, depreciation_method, depreciation_rate } = req.body;

    const result = await pool.query(
      `INSERT INTO asset_classes (name, useful_life_years, depreciation_method, depreciation_rate)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, useful_life_years, depreciation_method || 'straight_line', depreciation_rate || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create asset class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single asset
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, ac.name as class_name, ac.useful_life_years, ac.depreciation_method
      FROM assets a
      LEFT JOIN asset_classes ac ON a.asset_class_id = ac.id
      WHERE a.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Run depreciation for a specific period
router.post('/depreciate', periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
    const { period, months = 1 } = req.body;
    const userId = (req as any).userId || 1;

    await client.query('BEGIN');

    const assets = await client.query(`
      SELECT a.*, ac.depreciation_method, ac.useful_life_years
      FROM assets a
      JOIN asset_classes ac ON a.asset_class_id = ac.id
      WHERE a.status = 'active'
    `);

    let totalDepreciation = 0;
    let processedCount = 0;
    const depreciationDetails = [];

    for (const asset of assets.rows) {
      const calc = calculateDepreciation(asset, months);

      if (calc.depreciationAmount > 0) {
        // Update asset
        await client.query(
          `UPDATE assets 
           SET current_value = $1, 
               accumulated_depreciation = accumulated_depreciation + $2,
               last_depreciation_date = CURRENT_DATE,
               status = $3
           WHERE id = $4`,
          [
            calc.newValue,
            calc.depreciationAmount,
            calc.isFullyDepreciated ? 'fully_depreciated' : 'active',
            asset.id
          ]
        );

        totalDepreciation += calc.depreciationAmount;
        processedCount++;
        depreciationDetails.push({
          asset_id: asset.id,
          asset_name: asset.name,
          depreciation: calc.depreciationAmount,
          new_value: calc.newValue,
          method: calc.method
        });
      }
    }

    // Create journal entry if depreciation > 0
    if (totalDepreciation > 0) {
      const entryNumber = `DEP-${Date.now().toString().slice(-8)}`;
      const journal = await client.query(
        `INSERT INTO journal_entries (
          entry_number, description, entry_date, period, status, created_by
        ) VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
        [entryNumber, `Depreciation for ${period}`, period, userId]
      );

      const journalId = journal.rows[0].id;

      // Dr Depreciation Expense
      await client.query(
        `INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 28, $2, $3, 0, 'depreciation', $4, $5)`,
        [journalId, 'Depreciation Expense', totalDepreciation, null, entryNumber]
      );

      // Cr Accumulated Depreciation
      await client.query(
        `INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 8, $2, 0, $3, 'depreciation', $4, $5)`,
        [journalId, 'Accumulated Depreciation', totalDepreciation, null, entryNumber]
      );

      // Update assets with journal entry id
      for (const detail of depreciationDetails) {
        await client.query(
          'UPDATE assets SET last_journal_entry_id = $1 WHERE id = $2',
          [journalId, detail.asset_id]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      message: `Depreciation completed for ${processedCount} assets`,
      period,
      total_depreciation: totalDepreciation,
      processed: processedCount,
      details: depreciationDetails
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Depreciation error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Create asset
router.post('/', async (req, res) => {
  try {
    const {
      name, asset_class_id, purchase_date, purchase_cost,
      salvage_value, location, serial_number, branch_id
    } = req.body;

    const code = `AST${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO assets (
        code, name, asset_class_id, purchase_date, purchase_cost,
        salvage_value, current_value, location, serial_number, branch_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active') RETURNING *`,
      [code, name, asset_class_id, purchase_date, purchase_cost,
       salvage_value || 0, purchase_cost, location, serial_number, branch_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update asset
router.put('/:id', async (req, res) => {
  try {
    const {
      name, asset_class_id, purchase_date, purchase_cost,
      salvage_value, location, serial_number, branch_id, status
    } = req.body;

    const result = await pool.query(
      `UPDATE assets SET
        name = $1, asset_class_id = $2, purchase_date = $3,
        purchase_cost = $4, salvage_value = $5, location = $6,
        serial_number = $7, branch_id = $8, status = $9,
        updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [name, asset_class_id, purchase_date, purchase_cost,
       salvage_value, location, serial_number, branch_id, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Disposal of asset
router.post('/:id/dispose', periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
    const { disposal_date, disposal_value, reason } = req.body;
    const userId = (req as any).userId || 1;

    const asset = await client.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    if (asset.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const currentValue = parseFloat(asset.rows[0].current_value);
    const disposalAmount = disposal_value || currentValue;
    const gainLoss = disposalAmount - currentValue;

    await client.query('BEGIN');

    // Update asset
    await client.query(
      `UPDATE assets SET 
        status = 'disposed',
        disposal_date = $1,
        disposal_value = $2,
        disposal_reason = $3
       WHERE id = $4`,
      [disposal_date, disposalAmount, reason, req.params.id]
    );

    // Create journal entry
    const entryNumber = `DIS-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(
      `INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, $3, $4, 'posted', $5) RETURNING id`,
      [entryNumber, `Disposal: ${asset.rows[0].name}`, disposal_date, 
 String(disposal_date).substring(0, 7), userId]
    );

    const journalId = journal.rows[0].id;

    // Dr Bank (Proceeds)
    await client.query(
      `INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 4, $2, $3, 0, 'asset', $4, $5)`,
      [journalId, 'Bank - Asset Disposal', disposalAmount, req.params.id, entryNumber]
    );

    // Cr Asset (Current Value)
    await client.query(
      `INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 8, $2, 0, $3, 'asset', $4, $5)`,
      [journalId, 'Asset Cost', currentValue, req.params.id, entryNumber]
    );

    // Gain or Loss
    if (gainLoss > 0) {
      // Cr Gain on Disposal
      await client.query(
        `INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 29, $2, 0, $3, 'asset', $4, $5)`,
        [journalId, 'Gain on Disposal', gainLoss, req.params.id, entryNumber]
      );
  } else if (gainLoss < 0) {
  // Dr Loss on Disposal
  await client.query(
    `INSERT INTO journal_lines (
      journal_entry_id, account_id, description, debit, credit,
      source_type, source_id, source_reference
    ) VALUES ($1, 30, $2, $3, 0, 'asset', $4, $5)`,
    [journalId, 'Loss on Disposal', Math.abs(gainLoss), req.params.id, entryNumber]
  );
}

    await client.query('COMMIT');

    res.json({
      message: 'Asset disposed successfully',
      asset_id: req.params.id,
      journal_entry: entryNumber,
      disposal_amount: disposalAmount,
      gain_loss: gainLoss
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Disposal error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});





// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Transfer asset between branches
router.post('/:id/transfer', async (req, res) => {
  try {
    const { to_branch_id, transfer_date, notes } = req.body;
    const userId = (req as any).userId || 1;

    const asset = await pool.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    if (asset.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const oldBranch = asset.rows[0].branch_id;
    await pool.query(
      `UPDATE assets SET branch_id = $1, location = (SELECT name FROM branches WHERE id = $1), updated_at = NOW() WHERE id = $2`,
      [to_branch_id, req.params.id]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
       VALUES ($1, 'TRANSFER', 'assets', $2, $3, $4)`,
      [userId, req.params.id, JSON.stringify({ branch_id: oldBranch }), JSON.stringify({ branch_id: to_branch_id, notes })]
    );

    res.json({ message: 'Asset transferred', from_branch: oldBranch, to_branch: to_branch_id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Impair asset (write-down value)
router.post('/:id/impair', async (req, res) => {
  const client = await pool.connect();
  try {
    const { impairment_amount, reason } = req.body;
    const userId = (req as any).userId || 1;
    const impairmentAmount = parseFloat(impairment_amount);

    const asset = await client.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    if (asset.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const currentValue = parseFloat(asset.rows[0].current_value);
    const newValue = currentValue - impairmentAmount;

    await client.query('BEGIN');

    await client.query(
      'UPDATE assets SET current_value = $1, updated_at = NOW() WHERE id = $2',
      [newValue, req.params.id]
    );

    // Journal entry for impairment
    const entryNumber = `IMP-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(
      `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
       VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
      [entryNumber, `Impairment: ${asset.rows[0].name} - ${reason}`, new Date().toISOString().substring(0, 7), userId]
    );

    const journalId = journal.rows[0].id;

    // Dr Impairment Loss (use account 30 if exists, else 28)
    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 28, $2, $3, 0, $4, $5, $6)',
      [journalId, 'Impairment Loss', impairmentAmount, 'asset', req.params.id, entryNumber]
    );
    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference) VALUES ($1, 8, $2, 0, $3, $4, $5, $6)',
      [journalId, 'Accumulated Depreciation/Impairment', impairmentAmount, 'asset', req.params.id, entryNumber]
    );

    await client.query('COMMIT');

    res.json({ message: 'Asset impaired', new_value: newValue, impairment: impairmentAmount });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

export default router;