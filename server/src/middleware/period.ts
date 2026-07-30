import { Request, Response, NextFunction } from 'express';
import pool from '../db/pool.js';

export const validatePeriod = async (transactionDate: string, periodCode?: string) => {
  if (!periodCode) {
    const date = new Date(transactionDate);
    periodCode = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  const result = await pool.query(
    'SELECT * FROM closed_periods WHERE period = $1',
    [periodCode]
  );

  if (result.rows.length > 0) {
    throw new Error(`Period ${periodCode} is closed. Cannot post transactions.`);
  }

  return true;
};

export const periodGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionDate = 
      req.body.transaction_date || 
      req.body.entry_date || 
      req.body.invoice_date || 
      req.body.bill_date || 
      req.body.payment_date ||
      req.body.purchase_date ||
      new Date().toISOString().split('T')[0];

    const period = req.body.period || transactionDate.substring(0, 7);

    await validatePeriod(transactionDate, period);

    (req as any).period = period;
    (req as any).transactionDate = transactionDate;

    next();
  } catch (error: any) {
    res.status(400).json({
      error: 'Period validation failed',
      message: error.message
    });
  }
};