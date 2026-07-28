import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Get all employees
router.get('/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE is_active = true ORDER BY last_name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payroll runs
router.get('/runs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, u.full_name as created_by_name
      FROM payroll_runs pr
      LEFT JOIN users u ON pr.created_by = u.id
      ORDER BY pr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Run payroll
router.post('/run', async (req, res) => {
  const client = await pool.connect();
  try {
    const { period } = req.body;
    const userId = (req as any).userId || 1;

    await client.query('BEGIN');

    // Get all active employees
    const employees = await client.query('SELECT * FROM employees WHERE is_active = true');

    // Create payroll run
    const run = await client.query(
      `INSERT INTO payroll_runs (period, run_date, status, created_by) VALUES ($1, CURRENT_DATE, 'draft', $2) RETURNING *`,
      [period, userId]
    );

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    for (const emp of employees.rows) {
      const allowances = parseFloat(emp.housing_allowance) + parseFloat(emp.transport_allowance) + parseFloat(emp.other_allowance);
      const grossPay = parseFloat(emp.basic_salary) + allowances;

      // Simple PAYE: 7% if above 300k annual
      const monthlyThreshold = 25000;
      const taxablePay = Math.max(0, grossPay - monthlyThreshold);
      const payeTax = taxablePay * 0.07;

      // Pension: employee contribution
      const pensionEmployee = parseFloat(emp.basic_salary) * (parseFloat(emp.pension_rate) / 100);

      const totalDeductionsForEmp = payeTax + pensionEmployee;
      const netPay = grossPay - totalDeductionsForEmp;

      totalGross += grossPay;
      totalDeductions += totalDeductionsForEmp;
      totalNet += netPay;

      await client.query(
        `INSERT INTO payslips (payroll_run_id, employee_id, basic_salary, allowances, gross_pay, paye_tax, pension_employee, total_deductions, net_pay)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [run.rows[0].id, emp.id, emp.basic_salary, allowances, grossPay, payeTax, pensionEmployee, totalDeductionsForEmp, netPay]
      );
    }

    // Update run totals
    await client.query(
      'UPDATE payroll_runs SET total_gross = $1, total_deductions = $2, total_net = $3, status = $4 WHERE id = $5',
      [totalGross, totalDeductions, totalNet, 'posted', run.rows[0].id]
    );

    // Create journal entry
    const entryNumber = `PAY-${Date.now().toString().slice(-8)}`;
    const journal = await client.query(
      `INSERT INTO journal_entries (entry_number, description, entry_date, period, status, created_by)
       VALUES ($1, $2, CURRENT_DATE, $3, 'posted', $4) RETURNING id`,
      [entryNumber, `Payroll for ${period}`, period, userId]
    );

    // Dr Salaries (Gross Pay)
    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 24, $2, $3, 0)',
      [journal.rows[0].id, 'Salary Expense', totalGross]
    );

    // Cr Bank (Net Pay)
    await client.query(
      'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 4, $2, 0, $3)',
      [journal.rows[0].id, 'Bank - Net Pay', totalNet]
    );

    // Cr PAYE Payable
    const totalPaye = employees.rows.reduce((sum, emp) => {
      const gross = parseFloat(emp.basic_salary) + parseFloat(emp.housing_allowance) + parseFloat(emp.transport_allowance) + parseFloat(emp.other_allowance);
      return sum + Math.max(0, gross - 25000) * 0.07;
    }, 0);

    if (totalPaye > 0) {
      await client.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 13, $2, 0, $3)',
        [journal.rows[0].id, 'PAYE Payable', totalPaye]
      );
    }

    // Cr Pension Payable
    const totalPension = employees.rows.reduce((sum, emp) => sum + parseFloat(emp.basic_salary) * 0.08, 0);
    if (totalPension > 0) {
      await client.query(
        'INSERT INTO journal_lines (journal_entry_id, account_id, description, debit, credit) VALUES ($1, 15, $2, 0, $3)',
        [journal.rows[0].id, 'Pension Payable', totalPension]
      );
    }

    // Link journal to payroll run
    await client.query('UPDATE payroll_runs SET journal_entry_id = $1 WHERE id = $2', [journal.rows[0].id, run.rows[0].id]);

    await client.query('COMMIT');

    // Get complete run with payslips
    const payslips = await client.query(`
      SELECT p.*, e.first_name, e.last_name, e.code as employee_code
      FROM payslips p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.payroll_run_id = $1
    `, [run.rows[0].id]);

    res.status(201).json({
      run: { ...run.rows[0], total_gross: totalGross, total_deductions: totalDeductions, total_net: totalNet },
      payslips: payslips.rows
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payroll run error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Create employee
router.post('/employees', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, basic_salary, housing_allowance, transport_allowance, other_allowance } = req.body;
    const code = `EMP${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO employees (code, first_name, last_name, email, phone, basic_salary, housing_allowance, transport_allowance, other_allowance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [code, first_name, last_name, email, phone, basic_salary, housing_allowance, transport_allowance, other_allowance]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;