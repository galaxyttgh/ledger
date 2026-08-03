// import express from 'express';
// import pool from '../db/pool.js';
// import { periodGuard } from '../middleware/period.js';

// const router = express.Router();

// // Get all receipts
// router.get('/', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT r.*, c.name as customer_name, i.invoice_number
//       FROM receipts r
//       LEFT JOIN customers c ON r.customer_id = c.id
//       LEFT JOIN invoices i ON r.invoice_id = i.id
//       ORDER BY r.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get receipts error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Create receipt
// router.post('/', periodGuard, async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { customer_id, invoice_id, amount, payment_date, payment_method } = req.body;
//     const receiptAmount = parseFloat(amount);
//     const receiptNumber = `RCPT-${Date.now().toString().slice(-8)}`;

//     await client.query('BEGIN');

//     // Create receipt
//     const receipt = await client.query(`
//       INSERT INTO receipts (receipt_number, customer_id, invoice_id, amount, payment_date, payment_method)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `, [receiptNumber, customer_id, invoice_id, receiptAmount, payment_date, payment_method || 'bank_transfer']);

//     // Create journal entry
//     const entryNumber = `JV-${Date.now()}`;
//     const journal = await client.query(`
//       INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//       VALUES ($1, $2, $3, 'JUL-2026', 'posted', 1)
//       RETURNING id
//     `, [entryNumber, `Payment received - ${receiptNumber}`, payment_date]);

//     // Debit Bank
//     await client.query(`
//       INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//       VALUES ($1, 4, $2, $3, 0)
//     `, [journal.rows[0].id, `Receipt ${receiptNumber}`, receiptAmount]);

//     // Credit Accounts Receivable
//     await client.query(`
//       INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//       VALUES ($1, 5, $2, 0, $3)
//     `, [journal.rows[0].id, `Receipt ${receiptNumber}`, receiptAmount]);

//     // Update customer balance (reduce what they owe)
//     await client.query(
//       'UPDATE customers SET current_balance = current_balance - $1 WHERE id = $2',
//       [receiptAmount, customer_id]
//     );

//     // Update invoice status if fully paid
//     if (invoice_id) {
//       const invoice = await client.query('SELECT total FROM invoices WHERE id = $1', [invoice_id]);
//       const receipts = await client.query(
//         'SELECT COALESCE(SUM(amount), 0) as total_paid FROM receipts WHERE invoice_id = $1',
//         [invoice_id]
//       );
//       if (parseFloat(receipts.rows[0].total_paid) >= parseFloat(invoice.rows[0].total)) {
//         await client.query("UPDATE invoices SET status = 'paid' WHERE id = $1", [invoice_id]);
//       }
//     }

//     await client.query('COMMIT');

//     res.status(201).json(receipt.rows[0]);

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Create receipt error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// export default router;

import express from 'express';
import pool from '../db/pool.js';
import { periodGuard } from '../middleware/period.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all receipts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             c.name as customer_name, 
             i.invoice_number,
             je.entry_number as journal_entry
      FROM receipts r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN invoices i ON r.invoice_id = i.id
      LEFT JOIN journal_entries je ON r.journal_entry_id = je.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single receipt
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, c.name as customer_name, i.invoice_number
      FROM receipts r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN invoices i ON r.invoice_id = i.id
      WHERE r.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create receipt with subledger tracking
router.post('/', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
   const { customer_id, invoice_id, amount, payment_date, payment_method, reference_number, notes } = req.body;
    const userId = (req as any).userId || 1;
    const period = (req as any).period || payment_date.substring(0, 7);
    const receiptAmount = parseFloat(amount);
    const receiptNumber = `RCPT-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create receipt
   const receipt = await client.query(`
  INSERT INTO receipts (
    receipt_number, customer_id, invoice_id, amount, payment_date, payment_method, reference_number, notes
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *
`, [receiptNumber, customer_id, invoice_id, receiptAmount, payment_date, payment_method || 'bank_transfer', reference_number || null, notes || null]);

    const receiptId = receipt.rows[0].id;

    // ============================================
    // CREATE JOURNAL ENTRY WITH SUBLEDGER TRACKING
    // ============================================
    
    const entryNumber = `JV-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, $3, $4, 'posted', $5)
      RETURNING id
    `, [entryNumber, `Receipt ${receiptNumber}`, payment_date, period, userId]);

    const journalId = journal.rows[0].id;

    // 1. Debit Bank
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 4, $2, $3, 0, 'receipt', $4, $5)
    `, [journalId, `Receipt ${receiptNumber}`, receiptAmount, receiptId, receiptNumber]);

    // 2. Credit Accounts Receivable
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 5, $2, 0, $3, 'receipt', $4, $5)
    `, [journalId, `Receipt ${receiptNumber}`, receiptAmount, receiptId, receiptNumber]);

    // Link receipt to journal
    await client.query(
      'UPDATE receipts SET journal_entry_id = $1 WHERE id = $2',
      [journalId, receiptId]
    );

    // Create subledger reference
    await client.query(`
      INSERT INTO subledger_references (
        source_type, source_id, journal_entry_id, transaction_date, amount
      ) VALUES ($1, $2, $3, $4, $5)
    `, ['receipt', receiptId, journalId, payment_date, receiptAmount]);

    // Update customer balance (reduce what they owe)
    await client.query(
      'UPDATE customers SET current_balance = current_balance - $1 WHERE id = $2',
      [receiptAmount, customer_id]
    );

    // Update invoice status if fully paid
    if (invoice_id) {
      const invoice = await client.query('SELECT total FROM invoices WHERE id = $1', [invoice_id]);
      const receipts = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as total_paid FROM receipts WHERE invoice_id = $1',
        [invoice_id]
      );
      
      const totalPaid = parseFloat(receipts.rows[0].total_paid);
      const totalDue = parseFloat(invoice.rows[0].total);
      
      if (totalPaid >= totalDue) {
        await client.query("UPDATE invoices SET status = 'paid' WHERE id = $1", [invoice_id]);
      } else if (totalPaid > 0) {
        await client.query("UPDATE invoices SET status = 'partially_paid' WHERE id = $1", [invoice_id]);
      }
    }

    // Audit log
    await client.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, 'CREATE', 'receipts', $2, $3)
    `, [userId, receiptId, JSON.stringify({ receipt_number: receiptNumber, amount: receiptAmount })]);

    await client.query('COMMIT');

    res.status(201).json({
      ...receipt.rows[0],
      journal_entry_id: journalId,
      journal_entry: entryNumber
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create receipt error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Delete receipt (with audit)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId || 1;
    
    // Get receipt details for audit
    const receipt = await pool.query('SELECT * FROM receipts WHERE id = $1', [req.params.id]);
    if (receipt.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Reverse customer balance
    await pool.query(
      'UPDATE customers SET current_balance = current_balance + $1 WHERE id = $2',
      [receipt.rows[0].amount, receipt.rows[0].customer_id]
    );

    await pool.query('DELETE FROM receipts WHERE id = $1', [req.params.id]);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
       VALUES ($1, 'DELETE', 'receipts', $2, $3)`,
      [userId, req.params.id, JSON.stringify(receipt.rows[0])]
    );

    res.json({ message: 'Receipt deleted' });
  } catch (error) {
    console.error('Delete receipt error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;