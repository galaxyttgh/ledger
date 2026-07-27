import pool from './pool.js';

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'finance_officer',
        branch_id INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Chart of Accounts
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        parent_id INTEGER REFERENCES accounts(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Journal Entries
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        entry_number VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
        period VARCHAR(10) NOT NULL,
        branch_id INTEGER,
        status VARCHAR(20) DEFAULT 'draft',
        created_by INTEGER REFERENCES users(id),
        approved_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Journal Lines
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_lines (
        id SERIAL PRIMARY KEY,
        journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
        account_id INTEGER REFERENCES accounts(id),
        description TEXT,
        debit DECIMAL(15,2) DEFAULT 0,
        credit DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Customers
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        credit_limit DECIMAL(15,2) DEFAULT 0,
        current_balance DECIMAL(15,2) DEFAULT 0,
        branch_id INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Suppliers
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        tax_id VARCHAR(50),
        current_balance DECIMAL(15,2) DEFAULT 0,
        branch_id INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Invoices (AR)
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
        due_date DATE NOT NULL,
        description TEXT,
        subtotal DECIMAL(15,2) DEFAULT 0,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        total DECIMAL(15,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'draft',
        branch_id INTEGER,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Bills (AP)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        bill_number VARCHAR(50) UNIQUE NOT NULL,
        supplier_id INTEGER REFERENCES suppliers(id),
        bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
        due_date DATE NOT NULL,
        description TEXT,
        subtotal DECIMAL(15,2) DEFAULT 0,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        total DECIMAL(15,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'draft',
        branch_id INTEGER,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Audit Trail
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(100),
        record_id INTEGER,
        old_values JSONB,
        new_values JSONB,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('Database tables created successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default createTables;