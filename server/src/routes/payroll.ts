// import express from 'express';
// import pool from '../db/pool.js';

// const router = express.Router();

// // Get all employees
// router.get('/employees', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM employees WHERE is_active = true ORDER BY last_name');
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get payroll runs
// router.get('/runs', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT pr.*, u.full_name as created_by_name
//       FROM payroll_runs pr
//       LEFT JOIN users u ON pr.created_by = u.id
//       ORDER BY pr.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Run payroll
// router.post('/run', async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { period } = req.body;
//     const userId = (req as any).userId || 1;

//     await client.query('BEGIN');

//     // Get all active employees
//     const employees = await client.query('SELECT * FROM employees WHERE is_active = true');

//     // Create payroll run
//     const run = await client.query(
//       `INSERT INTO payroll_runs (period, run_date, status, created_by) VALUES ($1, CURRENT_DATE, 'draft', $2) RETURNING *`,
//       [period, userId]
//     );

//     let totalGross = 0;
//     let totalDeductions = 0;
//     let totalNet = 0;

//     for (const emp of employees.rows) {
//       const allowances = parseFloat(emp.housing_allowance) + parseFloat(emp.transport_allowance) + parseFloat(emp.other_allowance);
//       const grossPay = parseFloat(emp.basic_salary) + allowances;

//       // Simple PAYE: 7% if above 300k annual
//       const monthlyThreshold = 25000;
//       const taxablePay = Math.max(0, grossPay - monthlyThreshold);
//       const payeTax = taxablePay * 0.07;

//       // Pension: employee contribution
//       const pensionEmployee = parseFloat(emp.basic_salary) * (parseFloat(emp.pension_rate) / 100);

//       const totalDeductionsForEmp = payeTax + pensionEmployee;
//       const netPay = grossPay - totalDeductionsForEmp;

//       totalGross += grossPay;
//       totalDeductions += totalDeductionsForEmp;
//       totalNet += netPay;

//       await client.query(
//         `INSERT INTO payslips (payroll_run_id, employee_id, basic_salary, allowances, gross_pay, paye_tax, pension_employee, total_deductions, net_pay)
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//         [run.rows[0].id, emp.id, emp.basic_salary, allowances, grossPay, payeTax, pensionEmployee, totalDeductionsForEmp, netPay]
//       );
//     }

//     // Update run totals
//     await client.query(
//       'UPDATE payroll_runs SET total_gross = $1, total_deductions = $2, total_net = $3, status = $4 WHERE id = $5',
//       [totalGross, totalDeductions, totalNet, 'posted', run.rows[0].id]
//     );

//     // Create journal entry
//     const entryNumber = `PAY-${Date.now().toString().slice(-8)}`;
//     const journal = await client.query(
//       `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
//        VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
//       [entryNumber, `Payroll for ${period}`, period, userId]
//     );

//     // Dr Salaries (Gross Pay)
//     await client.query(
//       'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 24, $2, $3, 0)',
//       [journal.rows[0].id, 'Salary Expense', totalGross]
//     );

//     // Cr Bank (Net Pay)
//     await client.query(
//       'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 4, $2, 0, $3)',
//       [journal.rows[0].id, 'Bank - Net Pay', totalNet]
//     );

//     // Cr PAYE Payable
//     const totalPaye = employees.rows.reduce((sum, emp) => {
//       const gross = parseFloat(emp.basic_salary) + parseFloat(emp.housing_allowance) + parseFloat(emp.transport_allowance) + parseFloat(emp.other_allowance);
//       return sum + Math.max(0, gross - 25000) * 0.07;
//     }, 0);

//     if (totalPaye > 0) {
//       await client.query(
//         'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 13, $2, 0, $3)',
//         [journal.rows[0].id, 'PAYE Payable', totalPaye]
//       );
//     }

//     // Cr Pension Payable
//     const totalPension = employees.rows.reduce((sum, emp) => sum + parseFloat(emp.basic_salary) * 0.08, 0);
//     if (totalPension > 0) {
//       await client.query(
//         'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 15, $2, 0, $3)',
//         [journal.rows[0].id, 'Pension Payable', totalPension]
//       );
//     }

//     // Link journal to payroll run
//     await client.query('UPDATE payroll_runs SET journal_entry_id = $1 WHERE id = $2', [journal.rows[0].id, run.rows[0].id]);

//     await client.query('COMMIT');

//     // Get complete run with payslips
//     const payslips = await client.query(`
//       SELECT p.*, e.first_name, e.last_name, e.code as employee_code
//       FROM payslips p
//       JOIN employees e ON p.employee_id = e.id
//       WHERE p.payroll_run_id = $1
//     `, [run.rows[0].id]);

//     res.status(201).json({
//       run: { ...run.rows[0], total_gross: totalGross, total_deductions: totalDeductions, total_net: totalNet },
//       payslips: payslips.rows
//     });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Payroll run error:', error);
//     res.status(500).json({ error: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// // Create employee
// router.post('/employees', async (req, res) => {
//   try {
//     const { first_name, last_name, email, phone, basic_salary, housing_allowance, transport_allowance, other_allowance } = req.body;
//     const code = `EMP${Date.now().toString().slice(-6)}`;

//     const result = await pool.query(
//       `INSERT INTO employees (code, first_name, last_name, email, phone, basic_salary, housing_allowance, transport_allowance, other_allowance)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
//       [code, first_name, last_name, email, phone, basic_salary, housing_allowance, transport_allowance, other_allowance]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('Create employee error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// router.delete('/employees/:id', async (req, res) => {
//   try {
//     await pool.query('DELETE FROM employees WHERE id = $1', [req.params.id]);
//     res.json({ message: 'Employee deleted' });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Update employee
// router.put('/employees/:id', async (req, res) => {
//   try {
//     const { first_name, last_name, email, phone, basic_salary, housing_allowance, transport_allowance, other_allowance } = req.body;
//     const result = await pool.query(
//       `UPDATE employees SET first_name=$1, last_name=$2, email=$3, phone=$4, basic_salary=$5, housing_allowance=$6, transport_allowance=$7, other_allowance=$8 WHERE id=$9 RETURNING *`,
//       [first_name, last_name, email, phone, basic_salary, housing_allowance, transport_allowance, other_allowance, req.params.id]
//     );
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// export default router;

import express from 'express';
import pool from '../db/pool.js';
import { periodGuard } from '../middleware/period.js';

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

const calculatePayroll = (employee: any) => {
  const basicSalary = parseFloat(employee.basic_salary) || 0;
  const housingAllowance = parseFloat(employee.housing_allowance) || 0;
  const transportAllowance = parseFloat(employee.transport_allowance) || 0;
  const otherAllowance = parseFloat(employee.other_allowance) || 0;

  // Gross Pay
  const grossPay = basicSalary + housingAllowance + transportAllowance + otherAllowance;

  // Annualize for tax calculation
  const annualGross = grossPay * 12;

  // Personal Relief: ₦200,000 + 20% of gross income
  const personalRelief = 200000 + (annualGross * 0.2);

  // Pension (Employee): 8% of basic salary
  const pensionEmployee = basicSalary * 0.08;
  const pensionEmployer = basicSalary * 0.10;

  // NHF: 2.25% of basic salary
  const nhf = basicSalary * 0.0225;

  // NSITF (Employer): 1% of basic salary
  const nsitf = basicSalary * 0.01;

  // Taxable Income (Annual)
  const taxableIncome = annualGross - personalRelief - (pensionEmployee * 12) - (nhf * 12);

  // Annual PAYE
  const annualPAYE = Math.max(0, calculatePAYE(taxableIncome));
  const monthlyPAYE = annualPAYE / 12;

  // Total Deductions
  const totalDeductions = monthlyPAYE + pensionEmployee + nhf;

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
    nhf,
    nsitf,
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

    const payslipData = [];

    for (const emp of employees.rows) {
      // Calculate payroll
      const calc = calculatePayroll(emp);

      // Insert payslip
      await client.query(
        `INSERT INTO payslips (
          payroll_run_id, employee_id, 
          basic_salary, housing_allowance, transport_allowance, other_allowance,
          gross_pay, paye_tax, pension_employee, nhf, total_deductions, net_pay
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          runId,
          emp.id,
          calc.basicSalary,
          calc.housingAllowance,
          calc.transportAllowance,
          calc.otherAllowance,
          calc.grossPay,
          calc.monthlyPAYE,
          calc.pensionEmployee,
          calc.nhf,
          calc.totalDeductions,
          calc.netPay
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
        other_allowance = $8, bank_name = $9, bank_account = $10, is_active = $11,
        updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [first_name, last_name, email, phone,
       basic_salary, housing_allowance, transport_allowance, other_allowance,
       bank_name, bank_account, is_active, req.params.id]
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