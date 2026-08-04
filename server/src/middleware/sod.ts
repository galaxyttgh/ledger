import pool from '../db/pool.js';

export const sodCheck = async (req: any, res: any, next: any) => {
  const userId = req.userId;
  const { transaction_type, transaction_id } = req.body;

  if (!userId) return next();

  try {
    // Check if user is trying to approve their own transaction
    if (transaction_type && transaction_id) {
      const tableMap: any = {
        journal: 'journal_entries',
        invoice: 'invoices',
        bill: 'bills',
      };
      const table = tableMap[transaction_type];
      if (table) {
        const result = await pool.query(
          `SELECT created_by FROM ${table} WHERE id = $1`,
          [transaction_id]
        );
        if (result.rows.length > 0 && result.rows[0].created_by === userId) {
          return res.status(403).json({ 
            error: 'Segregation of Duties: You cannot approve your own transaction.' 
          });
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};