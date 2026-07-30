import pool from '../pool.js';

export const up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Running migration: Add subledger columns...');

    // Add source tracking to journal_lines
    await client.query(`
      ALTER TABLE journal_lines 
      ADD COLUMN IF NOT EXISTS source_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS source_id INTEGER,
      ADD COLUMN IF NOT EXISTS source_reference VARCHAR(100)
    `);

    // Add indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_lines_source 
      ON journal_lines(source_type, source_id)
    `);

    // Add journal_entry_id to all subledger tables
    const tables = ['invoices', 'bills', 'receipts', 'payments', 'payroll_runs'];
    for (const table of tables) {
      await client.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS journal_entry_id INTEGER REFERENCES journal_entries(id)
      `);
    }

    // Add tax_code to invoices and bills
    await client.query(`
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS tax_code VARCHAR(50)
    `);
    await client.query(`
      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS tax_code VARCHAR(50)
    `);

    // Create subledger_references table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subledger_references (
        id SERIAL PRIMARY KEY,
        source_type VARCHAR(50) NOT NULL,
        source_id INTEGER NOT NULL,
        journal_entry_id INTEGER REFERENCES journal_entries(id),
        transaction_date DATE NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tax_codes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tax_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(20) NOT NULL CHECK (category IN ('vat', 'wht', 'paye', 'other')),
        rate DECIMAL(5,2) NOT NULL,
        description TEXT,
        applies_to TEXT[],
        effective_from DATE NOT NULL,
        effective_to DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default tax codes
    await client.query(`
      INSERT INTO tax_codes (code, name, category, rate, description, applies_to, effective_from)
      VALUES 
        ('VAT-STANDARD', 'Value Added Tax - Standard Rate', 'vat', 7.5, 'Standard VAT rate', ARRAY['goods', 'services'], '2020-01-01'),
        ('VAT-EXEMPT', 'Value Added Tax - Exempt', 'vat', 0, 'Exempt from VAT', ARRAY['education', 'healthcare'], '2020-01-01'),
        ('WHT-CONSULT', 'Withholding Tax - Consulting', 'wht', 5, 'WHT for consulting services', ARRAY['consulting'], '2020-01-01'),
        ('WHT-RENT', 'Withholding Tax - Rent', 'wht', 10, 'WHT for rental income', ARRAY['rent'], '2020-01-01'),
        ('WHT-CONTRACT', 'Withholding Tax - Contract', 'wht', 2, 'WHT for contract services', ARRAY['contract'], '2020-01-01'),
        ('WHT-GOODS', 'Withholding Tax - Goods', 'wht', 2, 'WHT for goods supply', ARRAY['goods'], '2020-01-01'),
        ('PAYE-BASIC', 'PAYE - Basic Rate', 'paye', 7, 'Basic PAYE rate', ARRAY['salary'], '2020-01-01')
      ON CONFLICT (code) DO UPDATE SET
        rate = EXCLUDED.rate,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        applies_to = EXCLUDED.applies_to,
        is_active = true
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration
up().catch(console.error);