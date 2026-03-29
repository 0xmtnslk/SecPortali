/**
 * Migration: Add additional fields to facility_blocks table
 * 
 * This migration adds the following fields to the facility_blocks table:
 * - building_construction_year: INTEGER
 * - building_height: DECIMAL(10, 2)
 * - structure_height: DECIMAL(10, 2)
 * - floor_count: INTEGER
 * - closed_area: DECIMAL(15, 2)
 * - closed_parking_area: DECIMAL(15, 2)
 * - updated_at: TIMESTAMP
 */

const { query } = require('../src/config/database');

async function up() {
  try {
    console.log('Starting migration: Add facility_blocks additional fields');

    // Add columns if they don't exist
    const columns = [
      'building_construction_year INTEGER',
      'building_height DECIMAL(10, 2)',
      'structure_height DECIMAL(10, 2)',
      'floor_count INTEGER',
      'closed_area DECIMAL(15, 2)',
      'closed_parking_area DECIMAL(15, 2)',
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ];

    for (const column of columns) {
      try {
        await query(`ALTER TABLE facility_blocks ADD COLUMN IF NOT EXISTS ${column}`);
        console.log(`✓ Added column: ${column}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`- Column already exists: ${column.split(' ')[0]}`);
        } else {
          console.error(`✗ Error adding column ${column}:`, error.message);
        }
      }
    }

    // Create trigger for updated_at if it doesn't exist
    try {
      await query(`
        CREATE TRIGGER IF NOT EXISTS update_facility_blocks_updated_at
        BEFORE UPDATE ON facility_blocks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✓ Created trigger: update_facility_blocks_updated_at');
    } catch (error) {
      console.error('✗ Error creating trigger:', error.message);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('Rolling back migration: Remove facility_blocks additional fields');

    // Drop trigger
    try {
      await query(`DROP TRIGGER IF EXISTS update_facility_blocks_updated_at ON facility_blocks`);
      console.log('✓ Dropped trigger: update_facility_blocks_updated_at');
    } catch (error) {
      console.error('✗ Error dropping trigger:', error.message);
    }

    // Drop columns
    const columns = [
      'updated_at',
      'closed_parking_area',
      'closed_area',
      'floor_count',
      'structure_height',
      'building_height',
      'building_construction_year'
    ];

    for (const column of columns) {
      try {
        await query(`ALTER TABLE facility_blocks DROP COLUMN IF EXISTS ${column}`);
        console.log(`✓ Dropped column: ${column}`);
      } catch (error) {
        console.error(`✗ Error dropping column ${column}:`, error.message);
      }
    }

    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'up') {
    up()
      .then(() => {
        console.log('Migration up completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Migration up failed:', error);
        process.exit(1);
      });
  } else if (command === 'down') {
    down()
      .then(() => {
        console.log('Migration down completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Migration down failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: node 002-add-facility-blocks-fields.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
