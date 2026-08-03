import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Create budget
// router.post('/', async (req, res) => {
//   try {
//     const { name, period, lines } = req.body;
//     const userId = (req as any).userId || 1;

//     const budget = await pool.query(
//       'INSERT INTO budgets (name, period, status, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
//       [name, period, 'approved', userId]
//     );

//     for (const line of lines) {
//       await pool.query(
//         'INSERT INTO budget_lines (budget_id, account_id, amount) VALUES ($1, $2, $3)',
//         [budget.rows[0].id, line.account_id, line.amount]
//       );
//     }

//     res.status(201).json(budget.rows[0]);
//   } catch (error) {
//     console.error('Create budget error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// Create budget
router.post('/', async (req, res) => {
  try {
    const { name, period, lines, scenario } = req.body;
    const userId = (req as any).userId || 1;

    const budget = await pool.query(
      'INSERT INTO budgets (name, period, scenario, status, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, period, scenario || 'base', 'approved', userId]
    );

    for (const line of lines) {
      await pool.query(
        'INSERT INTO budget_lines (budget_id, account_id, amount) VALUES ($1, $2, $3)',
        [budget.rows[0].id, line.account_id, line.amount]
      );
    }

    res.status(201).json(budget.rows[0]);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Budget vs Actual Report
// router.get('/variance', async (req, res) => {
//   try {
//     const { period } = req.query;
    
//     const result = await pool.query(`
//       SELECT 
//         a.id,
//         a.code,
//         a.name,
//         a.type,
//         COALESCE(bl.amount, 0) as budget_amount,
//         CASE 
//           WHEN a.type IN ('revenue') THEN
//             COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
//           WHEN a.type IN ('expense') THEN
//             COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)
//           ELSE 0
//         END as actual_amount
//       FROM accounts a
//       LEFT JOIN budget_lines bl ON a.id = bl.account_id 
//         AND bl.budget_id IN (SELECT id FROM budgets WHERE period = $1)
//       LEFT JOIN journal_lines jl ON a.id = jl.account_id
//       LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id AND je.status = 'posted'
//       WHERE a.type IN ('revenue', 'expense')
//       GROUP BY a.id, a.code, a.name, a.type, bl.amount
//       ORDER BY a.code
//     `, [period]);

//     const data = result.rows.map(row => ({
//       ...row,
//       budget_amount: Number(row.budget_amount),
//       actual_amount: Number(row.actual_amount),
//       variance: Number(row.actual_amount) - Number(row.budget_amount),
//       variance_percent: Number(row.budget_amount) > 0 
//         ? ((Number(row.actual_amount) - Number(row.budget_amount)) / Number(row.budget_amount) * 100)
//         : 0
//     }));

//     const totalBudget = data.reduce((sum, d) => sum + d.budget_amount, 0);
//     const totalActual = data.reduce((sum, d) => sum + d.actual_amount, 0);

//     res.json({ lines: data, totalBudget, totalActual, variance: totalActual - totalBudget });

//   } catch (error) {
//     console.error('Variance error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// Budget vs Actual with scenario
router.get('/variance', async (req, res) => {
  try {
    const { period, scenario } = req.query;
    
    let budgetFilter = '';
    const params: any[] = [period];
    
    // if (scenario && scenario !== 'all') {
    //   budgetFilter = 'AND b.scenario = $2';
    //   params.push(scenario);
    // }
    
    if (scenario && scenario !== 'all') {
  budgetFilter = 'AND scenario = $2';
  params.push(scenario);
}
    // const result = await pool.query(`
    //   SELECT 
    //     a.id, a.code, a.name, a.type,
    //     COALESCE(bl.amount, 0) as budget_amount,
    //     CASE 
    //       WHEN a.type = 'revenue' THEN COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
    //       WHEN a.type = 'expense' THEN COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)
    //       ELSE 0
    //     END as actual_amount
    //   FROM accounts a
    //   LEFT JOIN budget_lines bl ON a.id = bl.account_id 
    //     AND bl.budget_id IN (
    //       SELECT id FROM budgets WHERE period = $1 ${budgetFilter}
    //     )
    //   LEFT JOIN journal_lines jl ON a.id = jl.account_id
    //   LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id AND je.status = 'posted'
    //   WHERE a.type IN ('revenue', 'expense')
    //   GROUP BY a.id, a.code, a.name, a.type, bl.amount
    //   ORDER BY a.code
    // `, params);
const result = await pool.query(`
  SELECT 
    a.id, a.code, a.name, a.type,
    COALESCE(bl.amount, 0) as budget_amount,
    CASE 
      WHEN a.type = 'revenue' THEN COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
      WHEN a.type = 'expense' THEN COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)
      ELSE 0
    END as actual_amount
  FROM accounts a
  LEFT JOIN budget_lines bl ON a.id = bl.account_id 
    AND bl.budget_id IN (
      SELECT id FROM budgets WHERE period = $1 ${budgetFilter}
    )
  LEFT JOIN journal_lines jl ON a.id = jl.account_id
  LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id AND je.status = 'posted'
  WHERE a.type IN ('revenue', 'expense')
  GROUP BY a.id, a.code, a.name, a.type, bl.amount
  ORDER BY a.code
`, params);

    const data = result.rows.map(row => ({
      ...row,
      budget_amount: Number(row.budget_amount),
      actual_amount: Number(row.actual_amount),
      variance: Number(row.actual_amount) - Number(row.budget_amount),
      variance_percent: Number(row.budget_amount) > 0 
        ? ((Number(row.actual_amount) - Number(row.budget_amount)) / Number(row.budget_amount) * 100)
        : 0
    }));

    const totalBudget = data.reduce((sum, d) => sum + d.budget_amount, 0);
    const totalActual = data.reduce((sum, d) => sum + d.actual_amount, 0);

    res.json({ 
      lines: data, 
      totalBudget, 
      totalActual, 
      variance: totalActual - totalBudget,
      scenario: scenario || 'all'
    });

  } catch (error) {
    console.error('Variance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get scenarios list
router.get('/scenarios', async (req, res) => {
  try {
    const { period } = req.query;
    const result = await pool.query(
      'SELECT DISTINCT scenario, COUNT(*) as count FROM budgets WHERE period = $1 GROUP BY scenario',
      [period]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;