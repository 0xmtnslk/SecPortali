const { query } = require('../src/config/database');

async function migrate() {
  console.log('Starting migration for RBAC...');
  try {
    // Add permissions column
    await query(`
      ALTER TABLE roles 
      ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS scope VARCHAR(50) DEFAULT 'FACILITY',
      ADD COLUMN IF NOT EXISTS parent_role_id UUID REFERENCES roles(id);
    `);
    console.log('Added permissions, scope, and parent_role_id columns to roles table.');

    // Update existing system roles with default scopes
    await query(`
      UPDATE roles SET scope = 'SYSTEM' WHERE name = 'Admin' OR name = 'Sistem Yöneticisi';
      UPDATE roles SET scope = 'GLOBAL' WHERE name = 'Central Manager';
    `);
    console.log('Updated existing roles with default scopes.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
