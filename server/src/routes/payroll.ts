import express from 'express';
import pool from '../db/pool.js';
import { periodGuard } from '../middleware/period.js';
import { sendEmail } from '../services/email.js';

const router = express.Router();

// ============================================
// NIGERIAN PAYE CALCULATION ENGINE
// ============================================

// Nigerian PAYE Tax Brackets (2024)
const PAYE_BRACKETS = [
  { upTo: 300000, rate: 0.07 },      // 7% on first ₦300k
  { upTo: 600000, rate: 0.11 },      // 11% on next ₦300k
  { upTo: 1100000, rate: 0.15 },     // 15% on next ₦500k
  { upTo: 1600000, rate: 0.19 },     // 19% on next ₦500k
  { upTo: 3200000, rate: 0.21 },     // 21% on next ₦1.6M
  { upTo: Infinity, rate: 0.24 }     // 24% above ₦3.2M
];

const calculatePAYE = (annualTaxableIncome: number): number => {
  let tax = 0;
  let remaining = annualTaxableIncome;
  let prevThreshold = 0;

  for (const bracket of PAYE_BRACKETS) {
    const slice = Math.min(remaining, bracket.upTo - prevThreshold);
    if (slice <= 0) break;
    tax += slice * bracket.rate;
    remaining -= slice;
    prevThreshold = bracket.upTo;
    if (remaining <= 0) break;
  }

  return tax;
};

const calculatePayroll = async (employee: any) => {
  const basicSalary = parseFloat(employee.basic_salary) || 0;
  const housingAllowance = parseFloat(employee.housing_allowance) || 0;
  const transportAllowance = parseFloat(employee.transport_allowance) || 0;
  const otherAllowance = parseFloat(employee.other_allowance) || 0;

  // Gross Pay
  const grossPay = basicSalary + housingAllowance + transportAllowance + otherAllowance;

  // Annualize for tax calculation
  const annualGross = grossPay * 12;

  // Fetch rates from tax_codes
  const ratesResult = await pool.query(`
    SELECT code, rate FROM tax_codes 
    WHERE code IN ('PENSION-EE', 'PENSION-ER', 'NHIS', 'JICHMA', 'NHF') 
    AND is_active = true
  `);
  
  const rates: any = {};
  ratesResult.rows.forEach((r: any) => {
    rates[r.code] = parseFloat(r.rate);
  });

  const pensionEmployeeRate = (rates['PENSION-EE'] || 8) / 100;
  const pensionEmployerRate = (rates['PENSION-ER'] || 10) / 100;
  const nhisRate = (rates['NHIS'] || 5) / 100;
  const jichmaRate = (rates['JICHMA'] || 1) / 100;
  const nhfRate = (rates['NHF'] || 2.5) / 100;

  // Personal Relief: ₦200,000 + 20% of gross income
  const personalRelief = 200000 + (annualGross * 0.2);

  // Deductions
  const pensionEmployee = basicSalary * pensionEmployeeRate;
  const pensionEmployer = basicSalary * pensionEmployerRate;
  const nhis = basicSalary * nhisRate;
  const jichma = basicSalary * jichmaRate;
  const nhf = basicSalary * nhfRate;

  // Taxable Income (Annual)
  const taxableIncome = annualGross - personalRelief - (pensionEmployee * 12) - (nhf * 12);

  // Annual PAYE
  const annualPAYE = Math.max(0, calculatePAYE(taxableIncome));
  const monthlyPAYE = annualPAYE / 12;

  // Total Deductions
  const totalDeductions = monthlyPAYE + pensionEmployee + nhis + jichma + nhf;

  // Net Pay
  const netPay = grossPay - totalDeductions;

  return {
    basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowance,
    grossPay,
    annualGross,
    personalRelief,
    pensionEmployee,
    pensionEmployer,
    nhis,
    jichma,
    nhf,
    taxableIncome: taxableIncome / 12,
    monthlyPAYE,
    annualPAYE,
    totalDeductions,
    netPay
  };
};

// ============================================
// PAYROLL ROUTES
// ============================================

// Get all employees
router.get('/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE is_active = true ORDER BY last_name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get employee by ID with payroll calculation preview
router.get('/employees/:id/calculate', async (req, res) => {
  try {
    const employee = await pool.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (employee.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const calculation = calculatePayroll(employee.rows[0]);
    res.json({
      employee: employee.rows[0],
      calculation
    });
  } catch (error) {
    console.error('Calculate employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payroll runs
router.get('/runs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, u.full_name as created_by_name,
             (SELECT COUNT(*) FROM payslips WHERE payroll_run_id = pr.id) as employee_count
      FROM payroll_runs pr
      LEFT JOIN users u ON pr.created_by = u.id
      ORDER BY pr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payroll run with payslips
router.get('/runs/:id', async (req, res) => {
  try {
    const run = await pool.query('SELECT * FROM payroll_runs WHERE id = $1', [req.params.id]);
    if (run.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll run not found' });
    }

    const payslips = await pool.query(`
      SELECT p.*, e.first_name, e.last_name, e.code as employee_code
      FROM payslips p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.payroll_run_id = $1
    `, [req.params.id]);

    res.json({
      ...run.rows[0],
      payslips: payslips.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// RUN PAYROLL (Complete with proper tax calculation)
router.post('/run', periodGuard, async (req, res) => {
  const client = await pool.connect();
  try {
    const { period } = req.body;
    const userId = (req as any).userId || 1;

    await client.query('BEGIN');
 const existingRun = await client.query(
      "SELECT id FROM payroll_runs WHERE period = $1 AND status = 'posted'",
      [period]
    );

    if (existingRun.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Payroll for ${period} has already been run. Delete the existing run first or use a different period.` 
      });
    }
    // Get all active employees
    const employees = await client.query('SELECT * FROM employees WHERE is_active = true');

    if (employees.rows.length === 0) {
      return res.status(400).json({ error: 'No active employees found' });
    }

    // Create payroll run
    const run = await client.query(
      `INSERT INTO payroll_runs (period, run_date, status, created_by) 
       VALUES ($1, CURRENT_DATE, 'draft', $2) RETURNING *`,
      [period, userId]
    );

    const runId = run.rows[0].id;
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalPAYE = 0;
    let totalPension = 0;
    let totalNHF = 0;

    const payslipData: any[] = [];

    for (const emp of employees.rows) {
      // Calculate payroll
      const calc = await calculatePayroll(emp);

      // Insert payslip
    await client.query(
  `INSERT INTO payslips (
    payroll_run_id, employee_id, 
    basic_salary, housing_allowance, transport_allowance, other_allowance,
    gross_pay, paye_tax, pension_employee, pension_employer, nhf, nhis, jichma, total_deductions, net_pay
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
  [
    runId, emp.id,
    calc.basicSalary, calc.housingAllowance, calc.transportAllowance, calc.otherAllowance,
    calc.grossPay, calc.monthlyPAYE, calc.pensionEmployee, calc.pensionEmployer, calc.nhf, calc.nhis, calc.jichma,
    calc.totalDeductions, calc.netPay
  ]
);

      payslipData.push({
        employee: `${emp.first_name} ${emp.last_name}`,
        ...calc
      });

      totalGross += calc.grossPay;
      totalDeductions += calc.totalDeductions;
      totalNet += calc.netPay;
      totalPAYE += calc.monthlyPAYE;
      totalPension += calc.pensionEmployee;
      totalNHF += calc.nhf;
    }

    // Update run totals
    await client.query(
      `UPDATE payroll_runs 
       SET total_gross = $1, total_deductions = $2, total_net = $3, status = 'posted' 
       WHERE id = $4`,
      [totalGross, totalDeductions, totalNet, runId]
    );

    // Create journal entry
    const entryNumber = `PAY-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(
      `INSERT INTO journal_entries (
        entry_number, description, entry_date, period, status, created_by
      ) VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
      [entryNumber, `Payroll for ${period}`, period, userId]
    );

    const journalId = journal.rows[0].id;

    // Journal lines with source tracking
    // Dr Salary Expense (Gross Pay)
    await client.query(
      `INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 24, $2, $3, 0, 'payroll', $4, $5)`,
      [journalId, 'Salary Expense', totalGross, runId, entryNumber]
    );

    // Cr Bank (Net Pay)
    await client.query(
      `INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit,
        source_type, source_id, source_reference
      ) VALUES ($1, 4, $2, 0, $3, 'payroll', $4, $5)`,
      [journalId, 'Bank - Net Pay', totalNet, runId, entryNumber]
    );

    // Cr PAYE Payable
    if (totalPAYE > 0) {
      await client.query(
        `INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 13, $2, 0, $3, 'payroll', $4, $5)`,
        [journalId, 'PAYE Payable', totalPAYE, runId, entryNumber]
      );
    }

    // Cr Pension Payable
    if (totalPension > 0) {
      await client.query(
        `INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 15, $2, 0, $3, 'payroll', $4, $5)`,
        [journalId, 'Pension Payable', totalPension, runId, entryNumber]
      );
    }

    // Cr NHF Payable
    if (totalNHF > 0) {
      await client.query(
        `INSERT INTO journal_lines (
          journal_entry_id, account_id, description, debit, credit,
          source_type, source_id, source_reference
        ) VALUES ($1, 16, $2, 0, $3, 'payroll', $4, $5)`,
        [journalId, 'NHF Payable', totalNHF, runId, entryNumber]
      );
    }
// Cr NHIS Payable
const totalNHIS = employees.rows.reduce((sum: number, emp: any) => {
  const calc = payslipData.find((p: any) => p.employee === `${emp.first_name} ${emp.last_name}`);
  return sum + (calc?.nhis || 0);
}, 0);
if (totalNHIS > 0) {
  await client.query(
    `INSERT INTO journal_lines (
      journal_entry_id, account_id, description, debit, credit,
      source_type, source_id, source_reference
    ) VALUES ($1, 37, $2, 0, $3, 'payroll', $4, $5)`,
    [journalId, 'NHIS Payable', totalNHIS, runId, entryNumber]
  );
}

// Cr Jichma Payable
const totalJichma = employees.rows.reduce((sum: number, emp: any) => {
  const calc = payslipData.find((p: any) => p.employee === `${emp.first_name} ${emp.last_name}`);
  return sum + (calc?.jichma || 0);
}, 0);
if (totalJichma > 0) {
  await client.query(
    `INSERT INTO journal_lines (
      journal_entry_id, account_id, description, debit, credit,
      source_type, source_id, source_reference
    ) VALUES ($1, 38, $2, 0, $3, 'payroll', $4, $5)`,
    [journalId, 'Jichma Payable', totalJichma, runId, entryNumber]
  );
}
    // Link journal to payroll run
    await client.query(
      'UPDATE payroll_runs SET journal_entry_id = $1 WHERE id = $2',
      [journalId, runId]
    );

    // Subledger reference
    await client.query(
      `INSERT INTO subledger_references (
        source_type, source_id, journal_entry_id, transaction_date, amount
      ) VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
      ['payroll', runId, journalId, totalNet]
    );

    await client.query('COMMIT');

    // Send payslip emails to all employees
try {
  for (const emp of employees.rows) {
    if (!emp.email) continue;
    
    const payslip = payslipData.find((p: any) => p.employee === `${emp.first_name} ${emp.last_name}`);
    if (!payslip) continue;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px; background: #1e3a5f; color: white;">
          <h1 style="margin: 0;">Galaxy ITT</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">Payslip — ${period}</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Dear ${emp.first_name} ${emp.last_name},</p>
          <p>Your payslip for ${period} is below:</p>
          
          <h3 style="color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 5px;">Earnings</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px;">Basic Salary</td><td style="padding: 6px; text-align: right;">₦${payslip.basicSalary.toLocaleString()}</td></tr>
            <tr><td style="padding: 6px;">Housing Allowance</td><td style="padding: 6px; text-align: right;">₦${payslip.housingAllowance.toLocaleString()}</td></tr>
            <tr><td style="padding: 6px;">Transport Allowance</td><td style="padding: 6px; text-align: right;">₦${payslip.transportAllowance.toLocaleString()}</td></tr>
            <tr style="border-top: 1px solid #ddd;"><td style="padding: 6px;"><strong>Gross Pay</strong></td><td style="padding: 6px; text-align: right;"><strong>₦${payslip.grossPay.toLocaleString()}</strong></td></tr>
          </table>

          <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px; margin-top: 20px;">Deductions</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px;">PAYE Tax</td><td style="padding: 6px; text-align: right;">₦${payslip.monthlyPAYE.toLocaleString()}</td></tr>
            <tr><td style="padding: 6px;">Pension (8%)</td><td style="padding: 6px; text-align: right;">₦${payslip.pensionEmployee.toLocaleString()}</td></tr>
            <tr><td style="padding: 6px;">NHF (2.5%)</td><td style="padding: 6px; text-align: right;">₦${payslip.nhf.toLocaleString()}</td></tr>
            <tr><td style="padding: 6px;">NHIS (5%)</td><td style="padding: 6px; text-align: right;">₦${payslip.nhis.toLocaleString()}</td></tr>
            <tr><td style="padding: 6px;">Jichma (1%)</td><td style="padding: 6px; text-align: right;">₦${payslip.jichma.toLocaleString()}</td></tr>
            <tr style="border-top: 1px solid #ddd;"><td style="padding: 6px;"><strong>Total Deductions</strong></td><td style="padding: 6px; text-align: right;"><strong>₦${payslip.totalDeductions.toLocaleString()}</strong></td></tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background: #16a34a; color: white; text-align: center; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px;">NET PAY</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold;">₦${payslip.netPay.toLocaleString()}</p>
          </div>
        </div>
        <div style="text-align: center; padding: 15px; background: #eee; color: #666; font-size: 12px;">
          © Galaxy ITT — Confidential
        </div>
      </div>
    `;
    await sendEmail(emp.email, `Payslip ${period} — Galaxy ITT`, html);
  }
} catch (emailError) {
  console.error('Payslip email failed:', emailError);
}

    res.status(201).json({
      message: 'Payroll run completed',
      run_id: runId,
      journal_entry: entryNumber,
      summary: {
        total_employees: employees.rows.length,
        total_gross: totalGross,
        total_deductions: totalDeductions,
        total_net: totalNet,
        total_paye: totalPAYE,
        total_pension: totalPension,
        total_nhf: totalNHF
      },
      payslips: payslipData
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Payroll run error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  } finally {
    client.release();
  }
});

// Create employee
router.post('/employees', async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone,
      basic_salary, housing_allowance, transport_allowance, other_allowance,
      bank_name, bank_account, branch_id
    } = req.body;

    const code = `EMP${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO employees (
        code, first_name, last_name, email, phone,
        basic_salary, housing_allowance, transport_allowance, other_allowance,
        bank_name, bank_account, branch_id, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true) RETURNING *`,
      [code, first_name, last_name, email, phone,
       basic_salary || 0, housing_allowance || 0, transport_allowance || 0, other_allowance || 0,
       bank_name, bank_account, branch_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update employee
router.put('/employees/:id', async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone,
      basic_salary, housing_allowance, transport_allowance, other_allowance,
      bank_name, bank_account, is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE employees SET 
        first_name = $1, last_name = $2, email = $3, phone = $4,
        basic_salary = $5, housing_allowance = $6, transport_allowance = $7,
        other_allowance = $8, bank_name = $9, bank_account = $10, 
        is_active = COALESCE($11, is_active),
        updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [first_name, last_name, email, phone,
       basic_salary, housing_allowance, transport_allowance, other_allowance,
       bank_name, bank_account, is_active || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Delete employee
router.delete('/employees/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE employees SET is_active = false WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;