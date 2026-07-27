import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
   
  try {
    const { email, password, full_name, role } = req.body;

    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role`,
      [email, hashedPassword, full_name, role || 'finance_officer']
    );

    // Create audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) 
       VALUES ($1, $2, $3, $4, $5)`,
      [result.rows[0].id, 'REGISTER', 'users', result.rows[0].id, JSON.stringify(result.rows[0])]
    );

    res.status(201).json({ message: 'User created', user: result.rows[0] });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id) 
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'LOGIN', 'users', user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;