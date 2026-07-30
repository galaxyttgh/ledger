// import express from 'express';
// import pool from '../db/pool.js';
// import { z } from 'zod';
// import { periodGuard } from '../middleware/period.js';

// const invoiceSchema = z.object({
//   customer_id: z.number().min(1),
//   invoice_date: z.string().min(1),
//   due_date: z.string().min(1),
//   description: z.string().min(1),
//   amount: z.number().positive('Amount must be positive'),
// });

// const router = express.Router();

// // Get all invoices
// router.get('/', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT i.*, c.name as customer_name, u.full_name as created_by_name
//       FROM invoices i
//       JOIN customers c ON i.customer_id = c.id
//       LEFT JOIN users u ON i.created_by = u.id
//       ORDER BY i.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get invoices error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Create invoice
// router.post('/',  periodGuard, async (req, res) => {
//   const client = await pool.connect();
//   const validation = invoiceSchema.safeParse(req.body);
// if (!validation.success) {
//   res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
//   return;
// }
//   try {
//     const { customer_id, invoice_date, due_date, description, amount } = req.body;
//     const taxRate = 0.075; // 7.5% VAT
//     const subtotal = parseFloat(amount);
//     const taxAmount = subtotal * taxRate;
//     const total = subtotal + taxAmount;

//     // Generate invoice number
//     const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

//     await client.query('BEGIN');

//     // Create invoice
//     const invoice = await client.query(`
//       INSERT INTO invoices (invoice_number, customer_id, invoice_date, due_date, description, subtotal, tax_amount, total, status, created_by)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'posted', 1)
//       RETURNING *
//     `, [invoiceNumber, customer_id, invoice_date, due_date, description, subtotal, taxAmount, total]);

//     // Create journal entry for the invoice
//     const entryNumber = `JV-${Date.now()}`;
//     const journal = await client.query(`
//       INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//       VALUES ($1, $2, $3, 'JUL-2026', 'posted', 1)
//       RETURNING id
//     `, [entryNumber, `Invoice ${invoiceNumber} - ${description}`, invoice_date]);

//     // Debit Accounts Receivable
//     await client.query(`
//       INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//       VALUES ($1, 5, $2, $3, 0)
//     `, [journal.rows[0].id, `Invoice ${invoiceNumber}`, total]);

//     // Credit Revenue
//     await client.query(`
//       INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//       VALUES ($1, 22, $2, 0, $3)
//     `, [journal.rows[0].id, `Revenue from ${invoiceNumber}`, subtotal]);

//     // Credit VAT Payable (if tax > 0)
//     if (taxAmount > 0) {
//       await client.query(`
//         INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//         VALUES ($1, 12, $2, 0, $3)
//       `, [journal.rows[0].id, `VAT on ${invoiceNumber}`, taxAmount]);
//     }

//     // Update customer balance
//     await client.query(
//       'UPDATE customers SET current_balance = current_balance + $1 WHERE id = $2',
//       [total, customer_id]
//     );

//     await client.query('COMMIT');

//     res.status(201).json(invoice.rows[0]);

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Create invoice error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// // Create credit note
// router.post('/credit-note', async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { customer_id, invoice_id, amount, reason } = req.body;
//     const creditAmount = parseFloat(amount);
//     const noteNumber = `CN-${Date.now().toString().slice(-8)}`;

//     await client.query('BEGIN');

//     // Create credit note (stored in invoices with negative total)
//     await client.query(`
//       INSERT INTO invoices (invoice_number, customer_id, invoice_date, due_date, description, subtotal, tax_amount, total, status, created_by)
//       VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, $3, 0, 0, $4, 'credit_note', $5)
//     `, [noteNumber, customer_id, reason || 'Credit Note', -creditAmount, (req as any).userId || 1]);

//     // Journal entry: Dr Revenue, Cr AR
//     const entryNumber = `JV-${Date.now()}`;
//     const journal = await client.query(`
//       INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//       VALUES ($1, $2, CURRENT_DATE, 'JUL-2026', 'posted', $3) RETURNING id
//     `, [entryNumber, `Credit Note ${noteNumber} - ${reason}`, (req as any).userId || 1]);

//     await client.query(
//       'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 22, $2, $3, 0)',
//       [journal.rows[0].id, 'Revenue reversal', creditAmount]
//     );
//     await client.query(
//       'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 5, $2, 0, $3)',
//       [journal.rows[0].id, 'AR reduction', creditAmount]
//     );

//     // Update customer balance
//     await client.query('UPDATE customers SET current_balance = current_balance - $1 WHERE id = $2', [creditAmount, customer_id]);

//     await client.query('COMMIT');
//     res.status(201).json({ message: 'Credit note created', note_number: noteNumber });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });
// export default router;

import express from 'express';
import pool from '../db/pool.js';
import { z } from 'zod';
import { periodGuard } from '../middleware/period.js';
import { authMiddleware } from '../middleware/auth.js';

const invoiceSchema = z.object({
  customer_id: z.number().min(1),
  invoice_date: z.string().min(1),
  due_date: z.string().min(1),
  description: z.string().min(1),
  subtotal: z.number().positive('Amount must be positive'),
  tax_code: z.string().optional(),
});

const router = express.Router();

// ============================================
// TAX CALCULATION ENGINE (Internal)
// ============================================

const getTaxRate = async (taxCode: string, transactionDate: string) => {
  const result = await pool.query(
    `SELECT * FROM tax_codes 
     WHERE code = $1 
     AND is_active = true
     AND effective_from <= $2
     AND (effective_to IS NULL OR effective_to >= $2)`,
    [taxCode, transactionDate]
  );

  if (result.rows.length === 0) {
    // Default to standard VAT if no specific code found
    return { rate: 7.5, code: 'VAT-STANDARD', name: 'VAT Standard' };
  }

  return result.rows[0];
};

const calculateTax = async (amount: number, taxCode: string | undefined, transactionDate: string) => {
  if (!taxCode) {
    return { taxAmount: 0, rate: 0, taxCode: null };
  }

  const tax = await getTaxRate(taxCode, transactionDate);
  const taxAmount = amount * (tax.rate / 100);

  return {
    taxAmount: Math.round(taxAmount * 100) / 100,
    rate: tax.rate,
    taxCode: tax.code,
    taxName: tax.name
  };
};

// ============================================
// ROUTES
// ============================================

// Get all invoices
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, 
             c.name as customer_name, 
             u.full_name as created_by_name,
             je.entry_number as journal_entry
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN journal_entries je ON i.journal_entry_id = je.id
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single invoice with lines
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await pool.query(`
      SELECT i.*, c.name as customer_name, c.code as customer_code
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1
    `, [req.params.id]);

    if (invoice.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get invoice items if they exist
    const items = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1',
      [req.params.id]
    );

    res.json({
      ...invoice.rows[0],
      items: items.rows
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create invoice with subledger tracking
router.post('/', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const validation = invoiceSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
      return;
    }

    const { 
      customer_id, 
      invoice_date, 
      due_date, 
      description, 
      subtotal,
      tax_code,
      items 
    } = req.body;

    const userId = (req as any).userId || 1;
    const period = (req as any).period || invoice_date.substring(0, 7);

    // Calculate tax
    const taxCalculation = await calculateTax(subtotal, tax_code, invoice_date);
    const taxAmount = taxCalculation.taxAmount;
    const total = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create invoice
    const invoice = await client.query(`
      INSERT INTO invoices (
        invoice_number, customer_id, invoice_date, due_date, description, 
        subtotal, tax_amount, total, tax_code, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'posted', $10)
      RETURNING *
    `, [invoiceNumber, customer_id, invoice_date, due_date, description, 
        subtotal, taxAmount, total, tax_code || 'VAT-STANDARD', userId]);

    const invoiceId = invoice.rows[0].id;

    // Create invoice items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(`
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
          VALUES ($1, $2, $3, $4, $5)
        `, [invoiceId, item.description, item.quantity || 1, item.unit_price || 0, item.total || 0]);
      }
    }

    // ============================================
    // CREATE JOURNAL ENTRY WITH SUBLEDGER TRACKING
    // ============================================
    
    const entryNumber = `JV-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, $3, $4, 'posted', $5)
      RETURNING id
    `, [entryNumber, `Invoice ${invoiceNumber} - ${description}`, invoice_date, period, userId]);

    const journalId = journal.rows[0].id;

    // 1. Debit Accounts Receivable (Customer)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 5, $2, $3, 0, 'invoice', $4, $5)
    `, [journalId, `AR - ${invoiceNumber}`, total, invoiceId, invoiceNumber]);

    // 2. Credit Revenue
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 22, $2, 0, $3, 'invoice', $4, $5)
    `, [journalId, `Revenue - ${invoiceNumber}`, subtotal, invoiceId, invoiceNumber]);

    // 3. Credit VAT Payable (if tax applies)
    if (taxAmount > 0) {
      await client.query(`
        INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 12, $2, 0, $3, 'invoice', $4, $5)
      `, [journalId, `VAT - ${invoiceNumber}`, taxAmount, invoiceId, invoiceNumber]);
    }

    // Link invoice to journal
    await client.query(
      'UPDATE invoices SET journal_entry_id = $1 WHERE id = $2',
      [journalId, invoiceId]
    );

    // Create subledger reference
    await client.query(`
      INSERT INTO subledger_references (
        source_type, source_id, journal_entry_id, transaction_date, amount
      ) VALUES ($1, $2, $3, $4, $5)
    `, ['invoice', invoiceId, journalId, invoice_date, total]);

    // Update customer balance
    await client.query(
      'UPDATE customers SET current_balance = current_balance + $1 WHERE id = $2',
      [total, customer_id]
    );

    // Audit log
    await client.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, 'CREATE', 'invoices', $2, $3)
    `, [userId, invoiceId, JSON.stringify({ invoice_number: invoiceNumber, total, customer_id })]);

    await client.query('COMMIT');

    res.status(201).json({
      ...invoice.rows[0],
      journal_entry_id: journalId,
      journal_entry: entryNumber,
      tax_calculation: taxCalculation
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Create credit note
router.post('/credit-note', authMiddleware, periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, invoice_id, amount, reason } = req.body;
    const userId = (req as any).userId || 1;
    const period = (req as any).period || new Date().toISOString().substring(0, 7);
    const creditAmount = parseFloat(amount);
    const noteNumber = `CN-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create credit note (stored in invoices with negative total)
    const invoice = await client.query(`
      INSERT INTO invoices (
        invoice_number, customer_id, invoice_date, due_date, description, 
        subtotal, tax_amount, total, status, created_by
      ) VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, $3, 0, 0, $4, 'credit_note', $5)
      RETURNING id
    `, [noteNumber, customer_id, reason || 'Credit Note', -creditAmount, userId]);

    const invoiceId = invoice.rows[0].id;

    // Journal entry with subledger tracking
    const entryNumber = `JV-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4)
      RETURNING id
    `, [entryNumber, `Credit Note ${noteNumber} - ${reason}`, period, userId]);

    const journalId = journal.rows[0].id;

    // Dr Revenue (reversal)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 22, $2, $3, 0, 'invoice', $4, $5)
    `, [journalId, `Revenue reversal - ${noteNumber}`, creditAmount, invoiceId, noteNumber]);

    // Cr AR (reversal)
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 5, $2, 0, $3, 'invoice', $4, $5)
    `, [journalId, `AR reduction - ${noteNumber}`, creditAmount, invoiceId, noteNumber]);

    // Link to journal
    await client.query(
      'UPDATE invoices SET journal_entry_id = $1 WHERE id = $2',
      [journalId, invoiceId]
    );

    // Subledger reference
    await client.query(`
      INSERT INTO subledger_references (
        source_type, source_id, journal_entry_id, transaction_date, amount
      ) VALUES ($1, $2, $3, CURRENT_DATE, $4)
    `, ['invoice', invoiceId, journalId, -creditAmount]);

    // Update customer balance
    await client.query(
      'UPDATE customers SET current_balance = current_balance - $1 WHERE id = $2',
      [creditAmount, customer_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ 
      message: 'Credit note created', 
      note_number: noteNumber,
      journal_entry: entryNumber
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Credit note error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Update invoice status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const userId = (req as any).userId || 1;

    const result = await pool.query(
      'UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'UPDATE_STATUS', 'invoices', $2, $3)`,
      [userId, req.params.id, JSON.stringify({ status })]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;