import pool from './pool.js';

const seedAccounts = async () => {
  const client = await pool.connect();
  
  try {
    // Check if accounts already exist
    const existing = await client.query('SELECT COUNT(*) FROM accounts');
    if (parseInt(existing.rows[0].count) > 0) {
      console.log('Accounts already seeded');
      return;
    }

    const accounts = [
      // Assets (1000-1999)
      { code: '1000', name: 'Assets', type: 'asset' },
      { code: '1100', name: 'Current Assets', type: 'asset' },
      { code: '1101', name: 'Cash in Hand', type: 'asset' },
      { code: '1102', name: 'Bank Account - GTBank', type: 'asset' },
      { code: '1103', name: 'Accounts Receivable', type: 'asset' },
      { code: '1200', name: 'Fixed Assets', type: 'asset' },
      { code: '1201', name: 'Office Equipment', type: 'asset' },
      { code: '1202', name: 'Accumulated Depreciation', type: 'asset' },
      
      // Liabilities (2000-2999)
      { code: '2000', name: 'Liabilities', type: 'liability' },
      { code: '2100', name: 'Current Liabilities', type: 'liability' },
      { code: '2101', name: 'Accounts Payable', type: 'liability' },
      { code: '2102', name: 'VAT Payable', type: 'liability' },
      { code: '2103', name: 'PAYE Payable', type: 'liability' },
      { code: '2104', name: 'WHT Payable', type: 'liability' },
      { code: '2105', name: 'Pension Payable', type: 'liability' },
      
      // Equity (3000-3999)
      { code: '3000', name: 'Equity', type: 'equity' },
      { code: '3100', name: 'Share Capital', type: 'equity' },
      { code: '3200', name: 'Retained Earnings', type: 'equity' },
      
      // Revenue (4000-4999)
      { code: '4000', name: 'Revenue', type: 'revenue' },
      { code: '4100', name: 'Service Revenue', type: 'revenue' },
      { code: '4200', name: 'Product Sales', type: 'revenue' },
      { code: '4300', name: 'Other Income', type: 'revenue' },
      
      // Expenses (5000-5999)
      { code: '5000', name: 'Expenses', type: 'expense' },
      { code: '5100', name: 'Salaries and Wages', type: 'expense' },
      { code: '5200', name: 'Rent Expense', type: 'expense' },
      { code: '5300', name: 'Utilities Expense', type: 'expense' },
      { code: '5400', name: 'Office Supplies', type: 'expense' },
      { code: '5500', name: 'Depreciation Expense', type: 'expense' },
      { code: '5600', name: 'Tax Expense', type: 'expense' },
    ];

    for (const account of accounts) {
      await client.query(
        'INSERT INTO accounts (code, name, type) VALUES ($1, $2, $3)',
        [account.code, account.name, account.type]
      );
    }

    console.log('Chart of accounts seeded successfully');
    
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    client.release();
  }
};

export default seedAccounts;