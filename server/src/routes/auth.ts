import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import rateLimit from 'express-rate-limit';


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many registration attempts. Please try again later.' },
});

const router = express.Router();

// Register
router.post('/register', registerLimiter, async (req, res) => {
   
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
router.post('/login', loginLimiter, async (req, res) => {
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

import crypto from 'crypto';

// Forgot Password - Send reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      // Don't reveal if email exists or not
      res.json({ message: 'If that email exists, a reset link has been sent.' });
      return;
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.rows[0].id, token, expiresAt]
    );

    // In production, send email here. For now, return the token.
    console.log(`Password reset token for ${email}: ${token}`);
    
    res.json({ 
      message: 'If that email exists, a reset link has been sent.',
      // Only in development:
      token: token,
      resetUrl: `http://localhost:5173/reset-password?token=${token}`
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find valid token
    const reset = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );

    if (reset.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [
      hashedPassword,
      reset.rows[0].user_id,
    ]);

    // Mark token as used
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [reset.rows[0].id]);

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id)
       VALUES ($1, 'PASSWORD_RESET', 'users', $1)`,
      [reset.rows[0].user_id]
    );

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
export default router;