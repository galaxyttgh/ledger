import express from 'express';
import pool from '../db/pool.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Add documents table if not exists
const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100),
      size INTEGER,
      transaction_type VARCHAR(50),
      transaction_id INTEGER,
      uploaded_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

ensureTable().catch(console.error);

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { transaction_type, transaction_id } = req.body;

    const result = await pool.query(
      `INSERT INTO documents (filename, original_name, mime_type, size, transaction_type, transaction_id, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, transaction_type, parseInt(transaction_id) || null, 1]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [1, 'UPLOAD', 'documents', result.rows[0].id, JSON.stringify({ filename: req.file.originalname })]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get documents for a transaction
router.get('/:type/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE transaction_type = $1 AND transaction_id = $2 ORDER BY created_at DESC',
      [req.params.type, req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download document
router.get('/download/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const doc = result.rows[0];
    const filePath = `uploads/${doc.filename}`;
    res.download(filePath, doc.original_name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

export default router;