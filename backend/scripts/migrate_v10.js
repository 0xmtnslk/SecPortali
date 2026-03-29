require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'asset_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'asset_management',
  password: process.env.DB_PASSWORD || 'asset_password',
  port: process.env.DB_PORT || 5432,
});

const migrate = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to DB, running Phase 10 migrations...');

    const queries = [
      'ALTER TABLE facilities ADD COLUMN IF NOT EXISTS tax_office VARCHAR(100)',
      'ALTER TABLE facilities ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50)'
    ];

    for (let sql of queries) {
      try {
        await client.query(sql);
        console.log(`Executed: ${sql}`);
      } catch (err) {
        console.error(`Error executing ${sql}:`, err.message);
      }
    }

    client.release();
    console.log('Phase 10 migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
