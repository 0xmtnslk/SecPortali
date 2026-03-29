const { query } = require('../../src/config/database');

async function up() {
  try {
    // floors tablosuna DXF kolonlarını ekle
    await query(`
      ALTER TABLE floors 
      ADD COLUMN IF NOT EXISTS dxf_file_path VARCHAR(500),
      ADD COLUMN IF NOT EXISTS dxf_parsed_data JSONB,
      ADD COLUMN IF NOT EXISTS dxf_uploaded_at TIMESTAMP;
    `);
    
    console.log('DXF columns added to floors table');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

async function down() {
  try {
    await query(`
      ALTER TABLE floors 
      DROP COLUMN IF EXISTS dxf_file_path,
      DROP COLUMN IF EXISTS dxf_parsed_data,
      DROP COLUMN IF EXISTS dxf_uploaded_at;
    `);
    
    console.log('DXF columns removed from floors table');
  } catch (error) {
    console.error('Migration rollback error:', error);
    throw error;
  }
}

module.exports = { up, down };

// Doğrudan çalıştırılırsa
if (require.main === module) {
  up().then(() => {
    console.log('Migration completed');
    process.exit(0);
  }).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}