import express from 'express';
import pool from '../db/pool.js';
import { sodCheck } from '../middleware/sod.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = express.Router();

// Submit for approval



router.post('/submit', async (req, res) => {
  try {
    const { transaction_type, transaction_id } = req.body;

    // Validate transaction exists
    const tableMap: any = {
      journal: 'journal_entries',
      invoice: 'invoices',
      bill: 'bills',
    };
    const table = tableMap[transaction_type];
    if (table) {
      const exists = await pool.query(`SELECT id FROM ${table} WHERE id = $1`, [transaction_id]);
      if (exists.rows.length === 0) {
        res.status(400).json({ error: `${transaction_type} with ID ${transaction_id} not found. Please check the ID and try again.` });
        return;
      }
    }

    // Check if rule exists
    const rule = await pool.query(
      'SELECT * FROM approval_rules WHERE transaction_type = $1 AND is_active = true ORDER BY priority',
      [transaction_type]
    );

    if (rule.rows.length === 0) {
      res.json({ message: 'No approval required', status: 'auto_approved' });
      return;
    }

    // Set SLA due date (48 hours from submission)
    const slaDueDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO approvals (transaction_type, transaction_id, submitted_by, status, sla_due_date)
       VALUES ($1, $2, 1, 'pending', $3) RETURNING *`,
      [transaction_type, transaction_id, slaDueDate]
    );

    res.status(201).json({ message: 'Submitted for approval', approval: result.rows[0] });

  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Get pending approvals


router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const userRole = (req as any).userRole;
    
    const result = await pool.query(`
      SELECT 
        a.id, a.transaction_type, a.transaction_id, a.description, a.amount,
        a.submitted_by, a.status as approval_status, a.submitted_at,
        u.full_name as submitted_by_name,
        aps.id as step_id,
        aps.step_order,
        aps.status as step_status,
        aps.comments as step_comments,
        (SELECT string_agg(step_role || ': ' || COALESCE(comments, 'No comment'), ' | ') 
 FROM approval_steps 
 WHERE approval_id = a.id AND status IN ('approved', 'rejected') AND comments IS NOT NULL) as previous_comments,
        (SELECT COUNT(*) FROM approval_steps WHERE approval_id = a.id) as total_steps
      FROM approvals a
      JOIN approval_steps aps ON a.id = aps.approval_id
      LEFT JOIN users u ON a.submitted_by = u.id
      WHERE aps.step_role = $1 
        AND aps.status = 'active'
        AND a.status = 'pending'
      ORDER BY aps.created_at
    `, [userRole]);
    
    // Also get simple approvals (no steps) where user is the approver
    const simplePending = await pool.query(`
      SELECT 
        a.id, a.transaction_type, a.transaction_id, a.description, a.amount,
        a.submitted_by, a.status, a.submitted_at,
        u.full_name as submitted_by_name,
        0 as total_steps
      FROM approvals a
      LEFT JOIN users u ON a.submitted_by = u.id
      WHERE a.status = 'pending'
        AND NOT EXISTS (SELECT 1 FROM approval_steps WHERE approval_id = a.id)
      ORDER BY a.submitted_at DESC
    `);
    
    const combined = simplePending.rows.map((row: any) => ({
      ...row,
      step_id: null,
      step_order: 0,
      step_status: 'active',
    }));

    res.json([...result.rows, ...combined]);
  } catch (error) {
    console.error('Pending error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/approve', sodCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId || 1;
    
    await pool.query(
      `UPDATE approvals SET status = 'approved', approved_by = $1, approved_at = NOW() WHERE id = $2`,
      [userId, id]
    );

    // Update the transaction status
    const approval = await pool.query('SELECT * FROM approvals WHERE id = $1', [id]);
    const { transaction_type, transaction_id } = approval.rows[0];

    if (transaction_type === 'journal') {
      await pool.query("UPDATE journal_entries SET status = 'approved' WHERE id = $1", [transaction_id]);
    } else if (transaction_type === 'invoice') {
      await pool.query("UPDATE invoices SET status = 'approved' WHERE id = $1", [transaction_id]);
    } else if (transaction_type === 'bill') {
      await pool.query("UPDATE bills SET status = 'approved' WHERE id = $1", [transaction_id]);
    }

    res.json({ message: 'Approved successfully' });

  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const userId = (req as any).userId || 1;

    await pool.query(
      `UPDATE approvals SET status = 'rejected', approved_by = $1, approved_at = NOW(), comments = $2 WHERE id = $3`,
      [userId, comments || 'Rejected', id]
    );

    res.json({ message: 'Rejected' });

  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get approval history
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, 
        u1.full_name as submitted_by_name,
        u2.full_name as approved_by_name
      FROM approvals a
      LEFT JOIN users u1 ON a.submitted_by = u1.id
      LEFT JOIN users u2 ON a.approved_by = u2.id
      WHERE a.status IN ('approved', 'rejected')
      ORDER BY a.submitted_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get approval rules
router.get('/rules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM approval_rules ORDER BY transaction_type, priority');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create multi-step approval request
// Create multi-step approval request (document-based)
router.post('/submit-multi', authMiddleware, async (req, res) => {
  try {
    const { 
      request_type, 
      description, 
      amount, 
      steps,
      notes 
    } = req.body;
    
    const userId = (req as any).userId || 1;

    // Validate
    if (!description || !request_type) {
      return res.status(400).json({ error: 'Description and request type are required' });
    }
    if (!steps || steps.length < 1) {
      return res.status(400).json({ error: 'At least one approval step is required' });
    }

    // Create approval with description
    const approval = await pool.query(
      `INSERT INTO approvals (transaction_type, transaction_id, description, amount, submitted_by, status)
       VALUES ($1, 0, $2, $3, $4, 'pending') RETURNING id`,
      [request_type, description, amount || 0, userId]
    );

    // Create steps
    for (let i = 0; i < steps.length; i++) {
      await pool.query(
        `INSERT INTO approval_steps (approval_id, step_order, step_role, status)
         VALUES ($1, $2, $3, 'pending')`,
        [approval.rows[0].id, i + 1, steps[i].role]
      );
    }

    // Set first step as active
    await pool.query(
      'UPDATE approval_steps SET status = $1 WHERE approval_id = $2 AND step_order = 1',
      ['active', approval.rows[0].id]
    );
// Notify first approver
try {
  const firstStep = await pool.query(
    'SELECT id, step_role FROM approval_steps WHERE approval_id = $1 AND step_order = 1',
    [approval.rows[0].id]
  );
  const approverRole = firstStep.rows[0].step_role;

  const approvers = await pool.query(
    'SELECT email FROM users WHERE role = $1 AND is_active = true',
    [approverRole]
  );

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px; background: #1e3a5f; color: white;">
        <h1 style="margin: 0;">Galaxy ITT</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.8;">Approval Required</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>A request is waiting for your approval.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-transform: capitalize;">${request_type}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${description}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${Number(amount || 0).toLocaleString()}</td></tr>
        </table>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/approvals" style="background: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Request</a>
        </div>
      </div>
      <div style="text-align: center; padding: 15px; background: #eee; color: #666; font-size: 12px;">
        Galaxy ITT — Automated message.
      </div>
    </div>
  `;

  for (const approver of approvers.rows) {
    await sendEmail(approver.email, 'Approval Required — Galaxy ITT', html);
  }
} catch (emailError) {
  console.error('First approver notification failed:', emailError);
}
    res.status(201).json({ 
      message: 'Approval request submitted',
      approval_id: approval.rows[0].id,
      total_steps: steps.length 
    });
  } catch (error) {
    console.error('Multi-step submit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending steps for current user
// Get pending steps for current user (only active step)
router.get('/my-pending', authMiddleware, async (req, res) => {
  try {
    const userRole = (req as any).userRole;
    const result = await pool.query(`
      SELECT aps.*, a.description, a.amount, a.request_type,
             a.submitted_by, u.full_name as submitted_by_name,
             (SELECT COUNT(*) FROM approval_steps WHERE approval_id = aps.approval_id) as total_steps
      FROM approval_steps aps
      JOIN approvals a ON aps.approval_id = a.id
      LEFT JOIN users u ON a.submitted_by = u.id
      WHERE aps.step_role = $1 
        AND aps.status = 'active'
        AND a.status = 'pending'
      ORDER BY aps.created_at
    `, [userRole]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Act on a step (approve/forward/reject with comment)
router.post('/steps/:stepId/act', authMiddleware, async (req, res) => {
  try {
    const { action, comments } = req.body;
    const userId = (req as any).userId || 1;

    // Update current step
    await pool.query(
      `UPDATE approval_steps SET status = $1, comments = $2, acted_by = $3, acted_at = NOW()
       WHERE id = $4`,
      [action, comments, userId, req.params.stepId]
    );

    const step = await pool.query(
      'SELECT approval_id, step_order FROM approval_steps WHERE id = $1',
      [req.params.stepId]
    );
    const approvalId = step.rows[0].approval_id;
    const stepOrder = step.rows[0].step_order;
// SoD check: user cannot approve their own request
const approvalOwner = await pool.query(
  'SELECT submitted_by FROM approvals WHERE id = $1',
  [approvalId]
);

if (approvalOwner.rows[0].submitted_by === userId) {
  return res.status(403).json({ 
    error: 'Segregation of Duties: You cannot approve your own request' 
  });
}
    if (action === 'rejected') {
      await pool.query('UPDATE approvals SET status = $1 WHERE id = $2', ['rejected', approvalId]);

      // Notify submitter of rejection
      try {
        const submitterInfo = await pool.query(
          `SELECT u.email, u.full_name, a.description, a.amount
           FROM approvals a
           JOIN users u ON a.submitted_by = u.id
           WHERE a.id = $1`,
          [approvalId]
        );

        if (submitterInfo.rows[0]?.email) {
          const s = submitterInfo.rows[0];
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px; background: #dc2626; color: white;">
                <h1 style="margin: 0;">Galaxy ITT</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Request Rejected</p>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <p>Hello ${s.full_name},</p>
                <p>Your request was rejected.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.description}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${Number(s.amount || 0).toLocaleString()}</td></tr>
                  ${comments ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${comments}</td></tr>` : ''}
                </table>
              </div>
              <div style="text-align: center; padding: 15px; background: #eee; color: #666; font-size: 12px;">
                Galaxy ITT — Automated message.
              </div>
            </div>
          `;
          await sendEmail(s.email, 'Request Rejected — Galaxy ITT', html);
        }
      } catch (emailError) {
        console.error('Rejection notification failed:', emailError);
      }

      return res.json({ message: 'Request rejected' });
    }

    // Check if there's a next step
    const nextStep = await pool.query(
      'SELECT id FROM approval_steps WHERE approval_id = $1 AND step_order = $2',
      [approvalId, stepOrder + 1]
    );

    if (nextStep.rows.length > 0) {
      // Activate next step
      await pool.query(
        'UPDATE approval_steps SET status = $1 WHERE id = $2',
        ['active', nextStep.rows[0].id]
      );

      // Notify next approver by email
      try {
        const stepInfo = await pool.query(
          'SELECT step_role FROM approval_steps WHERE id = $1',
          [nextStep.rows[0].id]
        );
        const approverRole = stepInfo.rows[0].step_role;

        const approvalInfo = await pool.query(
          `SELECT a.description, a.amount, a.transaction_type, u.full_name as submitted_by_name
           FROM approvals a
           LEFT JOIN users u ON a.submitted_by = u.id
           WHERE a.id = $1`,
          [approvalId]
        );

        const approvers = await pool.query(
          'SELECT email, full_name FROM users WHERE role = $1 AND is_active = true',
          [approverRole]
        );

        const approval = approvalInfo.rows[0];
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: #1e3a5f; color: white;">
              <h1 style="margin: 0;">Galaxy ITT</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.8;">Approval Required</p>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <p>A request is waiting for your approval.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-transform: capitalize;">${approval.transaction_type}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${approval.description}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${Number(approval.amount || 0).toLocaleString()}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Submitted By:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${approval.submitted_by_name}</td></tr>
              </table>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/approvals" style="background: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Request</a>
              </div>
            </div>
            <div style="text-align: center; padding: 15px; background: #eee; color: #666; font-size: 12px;">
              Galaxy ITT — Automated message.
            </div>
          </div>
        `;

        for (const approver of approvers.rows) {
          await sendEmail(approver.email, `Approval Required — Galaxy ITT`, html);
        }
      } catch (emailError) {
        console.error('Approval notification failed:', emailError);
      }

      res.json({ message: `Forwarded to step ${stepOrder + 1}` });
    } else {
      // No next step — final approved
      await pool.query(
        'UPDATE approvals SET status = $1, approved_by = $2, approved_at = NOW() WHERE id = $3',
        ['approved', userId, approvalId]
      );

      // Notify submitter of approval
      try {
        const submitterInfo = await pool.query(
          `SELECT u.email, u.full_name, a.description, a.amount
           FROM approvals a
           JOIN users u ON a.submitted_by = u.id
           WHERE a.id = $1`,
          [approvalId]
        );

        if (submitterInfo.rows[0]?.email) {
          const s = submitterInfo.rows[0];
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px; background: #16a34a; color: white;">
                <h1 style="margin: 0;">Galaxy ITT</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Request Approved</p>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <p>Hello ${s.full_name},</p>
                <p>Your request has been fully approved.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.description}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${Number(s.amount || 0).toLocaleString()}</td></tr>
                </table>
                <p>You can now proceed with the next steps.</p>
              </div>
              <div style="text-align: center; padding: 15px; background: #eee; color: #666; font-size: 12px;">
                Galaxy ITT — Automated message.
              </div>
            </div>
          `;
          await sendEmail(s.email, 'Request Approved — Galaxy ITT', html);
        }
      } catch (emailError) {
        console.error('Submitter notification failed:', emailError);
      }

      res.json({ message: 'Final approval complete' });
    }

  } catch (error) {
    console.error('Step act error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's own submissions
router.get('/my-submissions', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const result = await pool.query(`
      SELECT a.*, 
        (SELECT COUNT(*) FROM approval_steps WHERE approval_id = a.id) as total_steps,
        (SELECT COUNT(*) FROM approval_steps WHERE approval_id = a.id AND status IN ('approved', 'rejected')) as completed_steps,
        (SELECT string_agg(step_role, ' → ' ORDER BY step_order) FROM approval_steps WHERE approval_id = a.id) as chain
      FROM approvals a
      WHERE a.submitted_by = $1
      ORDER BY a.submitted_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('My submissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record payment against an approved request
router.post('/:id/record-payment', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { expense_account_id, bank_account_id, notes } = req.body;
    const userId = (req as any).userId || 1;

    const approval = await client.query(
      'SELECT * FROM approvals WHERE id = $1 AND status = $2',
      [req.params.id, 'approved']
    );

    if (approval.rows.length === 0) {
      return res.status(400).json({ error: 'Approval not found or not yet approved' });
    }

    const amount = parseFloat(approval.rows[0].amount) || 0;
    const description = approval.rows[0].description;
    const period = new Date().toISOString().substring(0, 7);
    const entryNumber = `APR-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    // Create journal entry
    const journal = await client.query(
      `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
       VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
      [entryNumber, `Approved Payment: ${description}`, period, userId]
    );

    const journalId = journal.rows[0].id;

    // Dr Expense
    await client.query(
      `INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference)
       VALUES ($1, $2, $3, $4, 0, 'approval', $5, $6)`,
      [journalId, expense_account_id || 27, description, amount, req.params.id, entryNumber]
    );

    // Cr Bank
    await client.query(
      `INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit, source_type, source_id, source_reference)
       VALUES ($1, $2, $3, 0, $4, 'approval', $5, $6)`,
      [journalId, bank_account_id || 4, `Payment for ${description}`, amount, req.params.id, entryNumber]
    );

    // Link to approval
    await client.query(
      'UPDATE approvals SET transaction_id = $1 WHERE id = $2',
      [journalId, req.params.id]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'PAYMENT_RECORDED', 'approvals', $2, $3)`,
      [userId, req.params.id, JSON.stringify({ entry_number: entryNumber, amount, description })]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Payment recorded and posted to General Ledger',
      journal_entry: entryNumber,
      amount,
      description,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Record payment error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});
export default router;