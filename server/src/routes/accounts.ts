import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM accounts ORDER BY code'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single account
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create account
router.post('/', async (req, res) => {
  try {
    const { code, name, type, parent_id } = req.body;

    // Check if code exists
    const exists = await pool.query(
      'SELECT id FROM accounts WHERE code = $1',
      [code]
    );
    if (exists.rows.length > 0) {
      res.status(400).json({ error: 'Account code already exists' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO accounts (code, name, type, parent_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [code, name, type, parent_id || null]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;