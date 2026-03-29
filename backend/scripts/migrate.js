require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'asset_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'asset_management_db',
  password: process.env.DB_PASSWORD || 'asset_secure_pass_2024',
  port: process.env.DB_PORT || 5432,
});

const migrate = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to DB, running ALTER TABLE assets...');

    const columns = [
      { name: 'equipment_id', type: 'UUID REFERENCES equipment_hierarchy(id)' },
      { name: 'block_id', type: 'UUID REFERENCES facility_blocks(id)' },
      { name: 'floor_id', type: 'UUID REFERENCES floors(id)' },
      { name: 'room_detail', type: 'VARCHAR(255)' },
      { name: 'qr_barcode', type: 'VARCHAR(100) UNIQUE' },
      { name: 'fixture_number', type: 'VARCHAR(100)' },
      { name: 'manufacturing_year', type: 'INTEGER' },
      { name: 'has_warranty', type: 'BOOLEAN DEFAULT false' },
      { name: 'energy_consumption_class', type: 'VARCHAR(10)' },
      { name: 'criticality_level', type: 'VARCHAR(20)' },
      { name: 'has_redundancy', type: 'BOOLEAN DEFAULT false' },
      { name: 'alternative_equipment', type: 'TEXT' },
      { name: 'depreciation_period_years', type: 'INTEGER' },
      { name: 'economic_life_years', type: 'INTEGER' },
      { name: 'planned_renewal_year', type: 'INTEGER' },
      { name: 'annual_maintenance_cost', type: 'DECIMAL(15, 2)' },
      { name: 'total_cost_of_ownership', type: 'DECIMAL(15, 2)' },
      { name: 'maintenance_types_arr', type: 'JSONB' },
      { name: 'maintenance_period', type: 'VARCHAR(50)' },
      { name: 'requires_periodic_control', type: 'BOOLEAN DEFAULT false' },
      { name: 'periodic_control_period', type: 'VARCHAR(50)' },
      { name: 'last_periodic_control_date', type: 'DATE' },
      { name: 'has_access_restriction', type: 'BOOLEAN DEFAULT false' },
      { name: 'is_in_critical_area', type: 'BOOLEAN DEFAULT false' }
    ];

    for (let col of columns) {
      try {
        await client.query(`ALTER TABLE assets ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name}`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`Column ${col.name} already exists. Skipping.`);
        } else {
          console.error(`Error adding column ${col.name}:`, err.message);
        }
      }
    }

    client.release();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
