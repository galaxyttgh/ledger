// import express from 'express';
// import pool from '../db/pool.js';
// import { periodGuard } from '../middleware/period.js';

// const router = express.Router();

// // Get all payments
// router.get('/', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT p.*, s.name as supplier_name, b.bill_number
//       FROM payments p
//       LEFT JOIN suppliers s ON p.supplier_id = s.id
//       LEFT JOIN bills b ON p.bill_id = b.id
//       ORDER BY p.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get payments error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Create payment
// router.post('/', periodGuard, async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { supplier_id, bill_id, amount, payment_date, payment_method } = req.body;
//     const paymentAmount = parseFloat(amount);
//     const paymentNumber = `PAY-${Date.now().toString().slice(-8)}`;

//     await client.query('BEGIN');

//     // Create payment
//     const payment = await client.query(`
//       INSERT INTO payments (payment_number, supplier_id, bill_id, amount, payment_date, payment_method)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `, [paymentNumber, supplier_id, bill_id, paymentAmount, payment_date, payment_method || 'bank_transfer']);

//     // Create journal entry
//     const entryNumber = `JV-${Date.now()}`;
//     const journal = await client.query(`
//       INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//       VALUES ($1, $2, $3, 'JUL-2026', 'posted', 1)
//       RETURNING id
//     `, [entryNumber, `Payment made - ${paymentNumber}`, payment_date]);

//     // Debit Accounts Payable (reduce what we owe)
//     await client.query(`
//       INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//       VALUES ($1, 11, $2, $3, 0)
//     `, [journal.rows[0].id, `Payment ${paymentNumber}`, paymentAmount]);

//     // Credit Bank (money leaves bank)
//     await client.query(`
//       INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit)
//       VALUES ($1, 4, $2, 0, $3)
//     `, [journal.rows[0].id, `Payment ${paymentNumber}`, paymentAmount]);

//     // Update supplier balance
//     await client.query(
//       'UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2',
//       [paymentAmount, supplier_id]
//     );

//     // Update bill status if fully paid
//     if (bill_id) {
//       const bill = await client.query('SELECT total FROM bills WHERE id = $1', [bill_id]);
//       const payments = await client.query(
//         'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE bill_id = $1',
//         [bill_id]
//       );
//       if (parseFloat(payments.rows[0].total_paid) >= parseFloat(bill.rows[0].total)) {
//         await client.query("UPDATE bills SET status = 'paid' WHERE id = $1", [bill_id]);
//       }
//     }

//     await client.query('COMMIT');

//     res.status(201).json(payment.rows[0]);

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Create payment error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// export default router;


import express, { Request, Response } from 'express';
import pool from '../db/pool.js';
import { periodGuard } from '../middleware/period.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Types
interface PaymentResult {
  id: number;
  payment_number: string;
  supplier_id: number;
  bill_id: number | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  wht_amount: number;
  net_amount: number;
  created_at: string;
  journal_entry_id: number | null;
}

interface WHTResult {
  whtAmount: number;
  rate: number;
  taxCode: string;
  taxName: string;
}

// WHT Calculation
const getWHTRate = async (transactionType: string, transactionDate: string): Promise<any> => {
  const whtMap: Record<string, string> = {
    'consulting': 'WHT-CONSULT',
    'rent': 'WHT-RENT',
    'contract': 'WHT-CONTRACT',
    'goods': 'WHT-GOODS',
    'services': 'WHT-SERVICES'
  };

  const taxCode = whtMap[transactionType] || 'WHT-CONSULT';

  const result = await pool.query(
    `SELECT * FROM tax_codes 
     WHERE code = $1 
     AND is_active = true
     AND effective_from <= $2
     AND (effective_to IS NULL OR effective_to >= $2)`,
    [taxCode, transactionDate]
  );

  if (result.rows.length === 0) {
    return { rate: 5, code: 'WHT-DEFAULT', name: 'WHT Default' };
  }

  return result.rows[0];
};

const calculateWHT = async (amount: number, transactionType: string, transactionDate: string): Promise<WHTResult> => {
  const tax = await getWHTRate(transactionType, transactionDate);
  const whtAmount = amount * (tax.rate / 100);

  return {
    whtAmount: Math.round(whtAmount * 100) / 100,
    rate: tax.rate,
    taxCode: tax.code,
    taxName: tax.name
  };
};

// ROUTES
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             s.name as supplier_name, 
             b.bill_number,
             je.entry_number as journal_entry
      FROM payments p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN bills b ON p.bill_id = b.id
      LEFT JOIN journal_entries je ON p.journal_entry_id = je.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single payment
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.name as supplier_name, b.bill_number
      FROM payments p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN bills b ON p.bill_id = b.id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payment
router.post('/', authMiddleware, periodGuard, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { 
      supplier_id, 
      bill_id, 
      amount, 
      payment_date, 
      payment_method,
      transaction_type
    } = req.body;
    
    const userId = (req as any).userId || 1;
    const period = (req as any).period || payment_date.substring(0, 7);
    const paymentAmount: number = parseFloat(amount);
    
    // FIX: Explicitly typed as string
    const paymentNumber: string = `PAY-${Date.now().toString().slice(-8)}`;

    const whtCalculation: WHTResult = await calculateWHT(
      paymentAmount, 
      transaction_type || 'services', 
      payment_date
    );
    
    const whtAmount: number = whtCalculation.whtAmount;
    const netPayment: number = paymentAmount - whtAmount;

    await client.query('BEGIN');

    // FIX: Explicitly type the query result
    const paymentResult = await client.query<PaymentResult>(`
      INSERT INTO payments (
        payment_number, supplier_id, bill_id, amount, 
        payment_date, payment_method, wht_amount, net_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [paymentNumber, supplier_id, bill_id, paymentAmount, 
        payment_date, payment_method || 'bank_transfer', whtAmount, netPayment]);

    const payment = paymentResult.rows[0];
    const paymentId: number = payment.id;

    // Journal entry
    const entryNumber: string = `JV-${Date.now().toString().slice(-8)}`;
    const journalResult = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, $3, $4, 'posted', $5)
      RETURNING id
    `, [entryNumber, `Payment ${paymentNumber}`, payment_date, period, userId]);

    const journalId: number = journalResult.rows[0].id;

    // Journal lines with subledger tracking
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 11, $2, $3, 0, 'payment', $4, $5)
    `, [journalId, `AP reduction - ${paymentNumber}`, paymentAmount, paymentId, paymentNumber]);

    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 4, $2, 0, $3, 'payment', $4, $5)
    `, [journalId, `Bank - ${paymentNumber}`, netPayment, paymentId, paymentNumber]);

    if (whtAmount > 0) {
      await client.query(`
        INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 14, $2, 0, $3, 'payment', $4, $5)
      `, [journalId, `WHT - ${paymentNumber}`, whtAmount, paymentId, paymentNumber]);
    }

    await client.query(
      'UPDATE payments SET journal_entry_id = $1 WHERE id = $2',
      [journalId, paymentId]
    );

    await client.query(`
      INSERT INTO subledger_references (
        source_type, source_id, journal_entry_id, transaction_date, amount
      ) VALUES ($1, $2, $3, $4, $5)
    `, ['payment', paymentId, journalId, payment_date, paymentAmount]);

    await client.query(
      'UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2',
      [paymentAmount, supplier_id]
    );

    if (bill_id) {
      const billResult = await client.query('SELECT total FROM bills WHERE id = $1', [bill_id]);
      const paymentsResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE bill_id = $1',
        [bill_id]
      );
      
      const totalPaid: number = parseFloat(paymentsResult.rows[0].total_paid);
      const totalDue: number = parseFloat(billResult.rows[0].total);
      
      if (totalPaid >= totalDue) {
        await client.query("UPDATE bills SET status = 'paid' WHERE id = $1", [bill_id]);
      } else if (totalPaid > 0) {
        await client.query("UPDATE bills SET status = 'partially_paid' WHERE id = $1", [bill_id]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...payment,
      journal_entry_id: journalId,
      journal_entry: entryNumber,
      wht_calculation: whtCalculation,
      net_payment: netPayment
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Batch payment
router.post('/batch', authMiddleware, periodGuard, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { supplier_id, bill_ids, payment_date, payment_method, transaction_type } = req.body;
    const userId = (req as any).userId || 1;
    const period = (req as any).period || payment_date.substring(0, 7);
    
    await client.query('BEGIN');

    let totalAmount: number = 0;
    let totalWHT: number = 0;
    let totalNet: number = 0;
    const paymentIds: number[] = [];

    for (const billId of bill_ids) {
      const billResult = await client.query('SELECT total FROM bills WHERE id = $1 AND status != $2', [billId, 'paid']);
      if (billResult.rows.length === 0) continue;

      const amount: number = parseFloat(billResult.rows[0].total);
      const paymentNumber: string = `PAY-${Date.now().toString().slice(-8)}-${paymentIds.length}`;

      const whtCalculation: WHTResult = await calculateWHT(amount, transaction_type || 'services', payment_date);
      const whtAmount: number = whtCalculation.whtAmount;
      const netPayment: number = amount - whtAmount;

      const paymentResult = await client.query(`
        INSERT INTO payments (
          payment_number, supplier_id, bill_id, amount, 
          payment_date, payment_method, wht_amount, net_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [paymentNumber, supplier_id, billId, amount, payment_date, 
          payment_method || 'bank_transfer', whtAmount, netPayment]);

      paymentIds.push(paymentResult.rows[0].id);
      totalAmount += amount;
      totalWHT += whtAmount;
      totalNet += netPayment;

      await client.query("UPDATE bills SET status = 'paid' WHERE id = $1", [billId]);
    }

    if (paymentIds.length === 0) {
      throw new Error('No valid bills to pay');
    }

    const entryNumber: string = `JV-${Date.now().toString().slice(-8)}`;
    const journalResult = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, $3, $4, 'posted', $5)
      RETURNING id
    `, [entryNumber, `Batch payment - ${paymentIds.length} bills`, payment_date, period, userId]);

    const journalId: number = journalResult.rows[0].id;

    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 11, $2, $3, 0, 'payment', $4, $5)
    `, [journalId, 'Batch AP reduction', totalAmount, null, entryNumber]);

    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 4, $2, 0, $3, 'payment', $4, $5)
    `, [journalId, 'Batch payment', totalNet, null, entryNumber]);

    if (totalWHT > 0) {
      await client.query(`
        INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 14, $2, 0, $3, 'payment', $4, $5)
      `, [journalId, 'Batch WHT', totalWHT, null, entryNumber]);
    }

    for (const pid of paymentIds) {
      await client.query(
        'UPDATE payments SET journal_entry_id = $1 WHERE id = $2',
        [journalId, pid]
      );
    }

    await client.query(
      'UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2',
      [totalAmount, supplier_id]
    );

    await client.query('COMMIT');

    res.json({
      message: `Batch payment processed for ${paymentIds.length} bills`,
      total_amount: totalAmount,
      total_wht: totalWHT,
      total_net: totalNet,
      journal_entry: entryNumber,
      payment_count: paymentIds.length
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Batch payment error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    
    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await pool.query(
      'UPDATE suppliers SET current_balance = current_balance + $1 WHERE id = $2',
      [paymentResult.rows[0].amount, paymentResult.rows[0].supplier_id]
    );

    await pool.query('DELETE FROM payments WHERE id = $1', [req.params.id]);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
       VALUES ($1, 'DELETE', 'payments', $2, $3)`,
      [userId, req.params.id, JSON.stringify(paymentResult.rows[0])]
    );

    res.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;