// import express, { Request, Response } from 'express';
// import pool from '../db/pool.js';
// import { periodGuard } from '../middleware/period.js';
// import { authMiddleware } from '../middleware/auth.js';
// import { sendEmail } from '../services/email.js';

// const router = express.Router();

// // Types
// interface PaymentResult {
//   id: number;
//   payment_number: string;
//   supplier_id: number;
//   bill_id: number | null;
//   amount: number;
//   payment_date: string;
//   payment_method: string;
//   wht_amount: number;
//   net_amount: number;
//   created_at: string;
//   journal_entry_id: number | null;
// }

// interface WHTResult {
//   whtAmount: number;
//   rate: number;
//   taxCode: string;
//   taxName: string;
// }

// // WHT Calculation
// const getWHTRate = async (transactionType: string, transactionDate: string): Promise<any> => {
//   const whtMap: Record<string, string> = {
//     'consulting': 'WHT-CONSULT',
//     'rent': 'WHT-RENT',
//     'contract': 'WHT-CONTRACT',
//     'goods': 'WHT-GOODS',
//     'services': 'WHT-SERVICES'
//   };

//   const taxCode = whtMap[transactionType] || 'WHT-CONSULT';

//   const result = await pool.query(
//     `SELECT * FROM tax_codes 
//      WHERE code = $1 
//      AND is_active = true
//      AND effective_from <= $2
//      AND (effective_to IS NULL OR effective_to >= $2)`,
//     [taxCode, transactionDate]
//   );

//   if (result.rows.length === 0) {
//     return { rate: 5, code: 'WHT-DEFAULT', name: 'WHT Default' };
//   }

//   return result.rows[0];
// };

// const calculateWHT = async (amount: number, transactionType: string, transactionDate: string): Promise<WHTResult> => {
//   const tax = await getWHTRate(transactionType, transactionDate);
//   const whtAmount = amount * (tax.rate / 100);

//   return {
//     whtAmount: Math.round(whtAmount * 100) / 100,
//     rate: tax.rate,
//     taxCode: tax.code,
//     taxName: tax.name
//   };
// };

// // ROUTES
// router.get('/', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const result = await pool.query(`
//       SELECT p.*, 
//              s.name as supplier_name, 
//              b.bill_number,
//              je.entry_number as journal_entry
//       FROM payments p
//       LEFT JOIN suppliers s ON p.supplier_id = s.id
//       LEFT JOIN bills b ON p.bill_id = b.id
//       LEFT JOIN journal_entries je ON p.journal_entry_id = je.id
//       ORDER BY p.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get payments error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get single payment
// router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const result = await pool.query(`
//       SELECT p.*, s.name as supplier_name, b.bill_number
//       FROM payments p
//       LEFT JOIN suppliers s ON p.supplier_id = s.id
//       LEFT JOIN bills b ON p.bill_id = b.id
//       WHERE p.id = $1
//     `, [req.params.id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Payment not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Get payment error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Create payment
// router.post('/', authMiddleware, periodGuard, async (req: Request, res: Response) => {
//   const client = await pool.connect();
//   try {
//    const { 
//   supplier_id, 
//   bill_id, 
//   amount, 
//   payment_date, 
//   payment_method,
//   transaction_type,
//   reference_number,
//   notes
// } = req.body;
    
//     const userId = (req as any).userId || 1;
//     const period = (req as any).period || payment_date.substring(0, 7);
//     const paymentAmount: number = parseFloat(amount);
    
//     // FIX: Explicitly typed as string
//     const paymentNumber: string = `PAY-${Date.now().toString().slice(-8)}`;

//     const whtCalculation: WHTResult = await calculateWHT(
//       paymentAmount, 
//       transaction_type || 'services', 
//       payment_date
//     );
    
//     const whtAmount: number = whtCalculation.whtAmount;
//     const netPayment: number = paymentAmount - whtAmount;

//     await client.query('BEGIN');

//     // FIX: Explicitly type the query result
//   const paymentResult = await client.query<PaymentResult>(`
//   INSERT INTO payments (
//     payment_number, supplier_id, bill_id, amount, 
//     payment_date, payment_method, wht_amount, net_amount,
//     reference_number, notes
//   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//   RETURNING *
// `, [paymentNumber, supplier_id, bill_id, paymentAmount, 
//     payment_date, payment_method || 'bank_transfer', whtAmount, netPayment,
//     reference_number || null, notes || null]);
    
//     const payment = paymentResult.rows[0];
//     const paymentId: number = payment.id;

//     // Journal entry
//     const entryNumber: string = `JV-${Date.now().toString().slice(-8)}`;
//     const journalResult = await client.query(`
//       INSERT INTO journal_entries (
//         entry_number, description, entry_date, period, status, created_by
//       ) VALUES ($1, $2, $3, $4, 'posted', $5)
//       RETURNING id
//     `, [entryNumber, `Payment ${paymentNumber}`, payment_date, period, userId]);

//     const journalId: number = journalResult.rows[0].id;

//     // Journal lines with subledger tracking
//     await client.query(`
//       INSERT INTO journal_lines (
//         journal_entry_id, account_id, description, debit, credit,
//         source_type, source_id, source_reference
//       ) VALUES ($1, 11, $2, $3, 0, 'payment', $4, $5)
//     `, [journalId, `AP reduction - ${paymentNumber}`, paymentAmount, paymentId, paymentNumber]);

//     await client.query(`
//       INSERT INTO journal_lines (
//         journal_entry_id, account_id, description, debit, credit,
//         source_type, source_id, source_reference
//       ) VALUES ($1, 4, $2, 0, $3, 'payment', $4, $5)
//     `, [journalId, `Bank - ${paymentNumber}`, netPayment, paymentId, paymentNumber]);

//     if (whtAmount > 0) {
//       await client.query(`
//         INSERT INTO journal_lines (
//           journal_entry_id, account_id, description, debit, credit,
//           source_type, source_id, source_reference
//         ) VALUES ($1, 14, $2, 0, $3, 'payment', $4, $5)
//       `, [journalId, `WHT - ${paymentNumber}`, whtAmount, paymentId, paymentNumber]);
//     }

//     await client.query(
//       'UPDATE payments SET journal_entry_id = $1 WHERE id = $2',
//       [journalId, paymentId]
//     );

//     await client.query(`
//       INSERT INTO subledger_references (
//         source_type, source_id, journal_entry_id, transaction_date, amount
//       ) VALUES ($1, $2, $3, $4, $5)
//     `, ['payment', paymentId, journalId, payment_date, paymentAmount]);

//     await client.query(
//       'UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2',
//       [paymentAmount, supplier_id]
//     );

//     if (bill_id) {
//       const billResult = await client.query('SELECT total FROM bills WHERE id = $1', [bill_id]);
//       const paymentsResult = await client.query(
//         'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE bill_id = $1',
//         [bill_id]
//       );
      
//       const totalPaid: number = parseFloat(paymentsResult.rows[0].total_paid);
//       const totalDue: number = parseFloat(billResult.rows[0].total);
      
//       if (totalPaid >= totalDue) {
//         await client.query("UPDATE bills SET status = 'paid' WHERE id = $1", [bill_id]);
//       } else if (totalPaid > 0) {
//         await client.query("UPDATE bills SET status = 'partially_paid' WHERE id = $1", [bill_id]);
//       }
//     }

//     await client.query('COMMIT');

//     // Send payment notification to supplier
// try {
//   const supplierResult = await pool.query('SELECT email, name FROM suppliers WHERE id = $1', [supplier_id]);
//   const supplier = supplierResult.rows[0];
  
//   if (supplier?.email) {
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="text-align: center; padding: 20px; background: #1e3a5f; color: white;">
//           <h1 style="margin: 0;">Galaxy ITT</h1>
//           <p style="margin: 5px 0 0 0; opacity: 0.8;">Payment Notification</p>
//         </div>
//         <div style="padding: 30px; background: #f9f9f9;">
//           <p>Dear ${supplier.name},</p>
//           <p>We have processed a payment to your account. Details below:</p>
//           <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//             <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${paymentNumber}</td></tr>
//             <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(payment_date).toLocaleDateString()}</td></tr>
//             <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${paymentAmount.toLocaleString()}</td></tr>
//             ${whtAmount > 0 ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>WHT Deducted:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${whtAmount.toLocaleString()}</td></tr>` : ''}
//             <tr><td style="padding: 12px 8px; background: #16a34a; color: white;"><strong>Net Amount Paid:</strong></td><td style="padding: 12px 8px; background: #16a34a; color: white;"><strong>₦${netPayment.toLocaleString()}</strong></td></tr>
//           </table>
//           <p>Please confirm receipt.</p>
//           <p>Thank you.</p>
//         </div>
//         <div style="text-align: center; padding: 15px; background: #eee; color: #666; font-size: 12px;">
//           © Galaxy ITT — Automated message.
//         </div>
//       </div>
//     `;
//     await sendEmail(supplier.email, `Payment Notification ${paymentNumber} — Galaxy ITT`, html);
//   }
// } catch (emailError) {
//   console.error('Payment email failed:', emailError);
// }
//     res.status(201).json({
//       ...payment,
//       journal_entry_id: journalId,
//       journal_entry: entryNumber,
//       wht_calculation: whtCalculation,
//       net_payment: netPayment
//     });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Create payment error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// // Batch payment
// router.post('/batch', authMiddleware, periodGuard, async (req: Request, res: Response) => {
//   const client = await pool.connect();
//   try {
//     const { supplier_id, bill_ids, payment_date, payment_method, transaction_type } = req.body;
//     const userId = (req as any).userId || 1;
//     const period = (req as any).period || payment_date.substring(0, 7);
    
//     await client.query('BEGIN');

//     let totalAmount: number = 0;
//     let totalWHT: number = 0;
//     let totalNet: number = 0;
//     const paymentIds: number[] = [];

//     for (const billId of bill_ids) {
//       const billResult = await client.query('SELECT total FROM bills WHERE id = $1 AND status != $2', [billId, 'paid']);
//       if (billResult.rows.length === 0) continue;

//       const amount: number = parseFloat(billResult.rows[0].total);
//       const paymentNumber: string = `PAY-${Date.now().toString().slice(-8)}-${paymentIds.length}`;

//       const whtCalculation: WHTResult = await calculateWHT(amount, transaction_type || 'services', payment_date);
//       const whtAmount: number = whtCalculation.whtAmount;
//       const netPayment: number = amount - whtAmount;

//       const paymentResult = await client.query(`
//         INSERT INTO payments (
//           payment_number, supplier_id, bill_id, amount, 
//           payment_date, payment_method, wht_amount, net_amount
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//         RETURNING id
//       `, [paymentNumber, supplier_id, billId, amount, payment_date, 
//           payment_method || 'bank_transfer', whtAmount, netPayment]);

//       paymentIds.push(paymentResult.rows[0].id);
//       totalAmount += amount;
//       totalWHT += whtAmount;
//       totalNet += netPayment;

//       await client.query("UPDATE bills SET status = 'paid' WHERE id = $1", [billId]);
//     }

//     if (paymentIds.length === 0) {
//       throw new Error('No valid bills to pay');
//     }

//     const entryNumber: string = `JV-${Date.now().toString().slice(-8)}`;
//     const journalResult = await client.query(`
//       INSERT INTO journal_entries (
//         entry_number, description, entry_date, period, status, created_by
//       ) VALUES ($1, $2, $3, $4, 'posted', $5)
//       RETURNING id
//     `, [entryNumber, `Batch payment - ${paymentIds.length} bills`, payment_date, period, userId]);

//     const journalId: number = journalResult.rows[0].id;

//     await client.query(`
//       INSERT INTO journal_lines (
//         journal_entry_id, account_id, description, debit, credit,
//         source_type, source_id, source_reference
//       ) VALUES ($1, 11, $2, $3, 0, 'payment', $4, $5)
//     `, [journalId, 'Batch AP reduction', totalAmount, null, entryNumber]);

//     await client.query(`
//       INSERT INTO journal_lines (
//         journal_entry_id, account_id, description, debit, credit,
//         source_type, source_id, source_reference
//       ) VALUES ($1, 4, $2, 0, $3, 'payment', $4, $5)
//     `, [journalId, 'Batch payment', totalNet, null, entryNumber]);

//     if (totalWHT > 0) {
//       await client.query(`
//         INSERT INTO journal_lines (
//           journal_entry_id, account_id, description, debit, credit,
//           source_type, source_id, source_reference
//         ) VALUES ($1, 14, $2, 0, $3, 'payment', $4, $5)
//       `, [journalId, 'Batch WHT', totalWHT, null, entryNumber]);
//     }

//     for (const pid of paymentIds) {
//       await client.query(
//         'UPDATE payments SET journal_entry_id = $1 WHERE id = $2',
//         [journalId, pid]
//       );
//     }

//     await client.query(
//       'UPDATE suppliers SET current_balance = current_balance - $1 WHERE id = $2',
//       [totalAmount, supplier_id]
//     );

//     await client.query('COMMIT');

//     res.json({
//       message: `Batch payment processed for ${paymentIds.length} bills`,
//       total_amount: totalAmount,
//       total_wht: totalWHT,
//       total_net: totalNet,
//       journal_entry: entryNumber,
//       payment_count: paymentIds.length
//     });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Batch payment error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const userId = (req as any).userId || 1;
    
//     const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
//     if (paymentResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Payment not found' });
//     }

//     await pool.query(
//       'UPDATE suppliers SET current_balance = current_balance + $1 WHERE id = $2',
//       [paymentResult.rows[0].amount, paymentResult.rows[0].supplier_id]
//     );

//     await pool.query('DELETE FROM payments WHERE id = $1', [req.params.id]);

//     await pool.query(
//       `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
//        VALUES ($1, 'DELETE', 'payments', $2, $3)`,
//       [userId, req.params.id, JSON.stringify(paymentResult.rows[0])]
//     );

//     res.json({ message: 'Payment deleted' });
//   } catch (error) {
//     console.error('Delete payment error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// export default router;\

import express, { Request, Response } from 'express';
import pool from '../db/pool.js';
import { periodGuard } from '../middleware/period.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = express.Router();

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

// Create payment — UPDATED with bank_account_id
router.post('/', authMiddleware, periodGuard, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { 
      supplier_id, 
      bill_id, 
      amount, 
      payment_date, 
      payment_method,
      transaction_type,
      reference_number,
      notes,
      bank_account_id  // ← CHANGED
    } = req.body;
    
    const userId = (req as any).userId || 1;
    const period = (req as any).period || payment_date.substring(0, 7);
    const paymentAmount: number = parseFloat(amount);
    const paymentNumber: string = `PAY-${Date.now().toString().slice(-8)}`;

    const whtCalculation: WHTResult = await calculateWHT(
      paymentAmount, 
      transaction_type || 'services', 
      payment_date
    );
    
    const whtAmount: number = whtCalculation.whtAmount;
    const netPayment: number = paymentAmount - whtAmount;

    await client.query('BEGIN');

    // ← CHANGED: Look up bank GL account
    let glAccountId = 4; // default GTBank
    if (bank_account_id) {
      const bank = await client.query('SELECT account_id FROM bank_accounts WHERE id = $1', [bank_account_id]);
      if (bank.rows[0]?.account_id) {
        glAccountId = bank.rows[0].account_id;
      }
    }

    // ← CHANGED: Added bank_account_id column
    const paymentResult = await client.query<PaymentResult>(`
      INSERT INTO payments (
        payment_number, supplier_id, bill_id, amount, 
        payment_date, payment_method, wht_amount, net_amount,
        reference_number, notes, bank_account_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [paymentNumber, supplier_id, bill_id, paymentAmount, 
        payment_date, payment_method || 'bank_transfer', whtAmount, netPayment,
        reference_number || null, notes || null, bank_account_id || null]);
    
    const payment = paymentResult.rows[0];
    const paymentId: number = payment.id;

    const entryNumber: string = `JV-${Date.now().toString().slice(-8)}`;
    const journalResult = await client.query(`
      INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, $3, $4, 'posted', $5)
      RETURNING id
    `, [entryNumber, `Payment ${paymentNumber}`, payment_date, period, userId]);

    const journalId: number = journalResult.rows[0].id;

    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 11, $2, $3, 0, 'payment', $4, $5)
    `, [journalId, `AP reduction - ${paymentNumber}`, paymentAmount, paymentId, paymentNumber]);

    // ← CHANGED: Use glAccountId instead of hardcoded 4
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, $2, $3, 0, $4, 'payment', $5, $6)
    `, [journalId, glAccountId, `Bank - ${paymentNumber}`, netPayment, paymentId, paymentNumber]);

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

    // Send payment notification to supplier
    try {
      const supplierResult = await pool.query('SELECT email, name FROM suppliers WHERE id = $1', [supplier_id]);
      const supplier = supplierResult.rows[0];
      
      if (supplier?.email) {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: #1e3a5f; color: white;">
              <h1 style="margin: 0;">Galaxy ITT</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.8;">Payment Notification</p>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <p>Dear ${supplier.name},</p>
              <p>We have processed a payment to your account. Details below:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${paymentNumber}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(payment_date).toLocaleDateString()}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${paymentAmount.toLocaleString()}</td></tr>
                ${whtAmount > 0 ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>WHT Deducted:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${whtAmount.toLocaleString()}</td></tr>` : ''}
                <tr><td style="padding: 12px 8px; background: #16a34a; color: white;"><strong>Net Amount Paid:</strong></td><td style="padding: 12px 8px; background: #16a34a; color: white;"><strong>₦${netPayment.toLocaleString()}</strong></td></tr>
              </table>
              <p>Please confirm receipt.</p>
              <p>Thank you.</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #eee; color: #666; font-size: 12px;">
              © Galaxy ITT — Automated message.
            </div>
          </div>
        `;
        await sendEmail(supplier.email, `Payment Notification ${paymentNumber} — Galaxy ITT`, html);
      }
    } catch (emailError) {
      console.error('Payment email failed:', emailError);
    }

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

// Batch payment — UPDATED with bank_account_id
router.post('/batch', authMiddleware, periodGuard, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { supplier_id, bill_ids, payment_date, payment_method, transaction_type, bank_account_id } = req.body;
    const userId = (req as any).userId || 1;
    const period = (req as any).period || payment_date.substring(0, 7);
    
    await client.query('BEGIN');

    // ← CHANGED: Look up bank GL account
    let glAccountId = 4;
    if (bank_account_id) {
      const bank = await client.query('SELECT account_id FROM bank_accounts WHERE id = $1', [bank_account_id]);
      if (bank.rows[0]?.account_id) {
        glAccountId = bank.rows[0].account_id;
      }
    }

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

      // ← CHANGED: Added bank_account_id
      const paymentResult = await client.query(`
        INSERT INTO payments (
          payment_number, supplier_id, bill_id, amount, 
          payment_date, payment_method, wht_amount, net_amount, bank_account_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [paymentNumber, supplier_id, billId, amount, payment_date, 
          payment_method || 'bank_transfer', whtAmount, netPayment, bank_account_id || null]);

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

    // ← CHANGED: Use glAccountId
    await client.query(`
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, $2, $3, 0, $4, 'payment', $5, $6)
    `, [journalId, glAccountId, 'Batch payment', totalNet, null, entryNumber]);

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