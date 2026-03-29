/**
 * Migration: Create equipment_hierarchy table
 * 
 * This migration creates the equipment_hierarchy table with a 4-level hierarchy structure:
 * - Level 0: Ekipman Cinsi (Equipment Type)
 * - Level 1: Kategori (Category)
 * - Level 2: Alt Kategori (Subcategory)
 * - Level 3: Tür (Type)
 * 
 * Uses Adjacency List model with self-referencing parent_id
 */

const { query } = require('../../src/config/database');

async function up() {
  try {
    console.log('Starting migration: Create equipment_hierarchy table');

    // Create equipment_hierarchy table
    await query(`
      CREATE TABLE IF NOT EXISTS equipment_hierarchy (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES equipment_hierarchy(id) ON DELETE CASCADE,
        level INTEGER NOT NULL CHECK (level >= 0 AND level <= 3),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created table: equipment_hierarchy');

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_hierarchy_parent_id 
      ON equipment_hierarchy(parent_id)
    `);
    console.log('✓ Created index: idx_equipment_hierarchy_parent_id');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_hierarchy_level 
      ON equipment_hierarchy(level)
    `);
    console.log('✓ Created index: idx_equipment_hierarchy_level');

    // Create trigger for updated_at
    await query(`
      CREATE OR REPLACE FUNCTION update_equipment_hierarchy_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✓ Created function: update_equipment_hierarchy_updated_at');

    // Drop trigger if exists
    try {
      await query(`
        DROP TRIGGER IF EXISTS update_equipment_hierarchy_updated_at ON equipment_hierarchy
      `);
    } catch (error) {
      // Ignore if trigger doesn't exist
    }

    await query(`
      CREATE TRIGGER update_equipment_hierarchy_updated_at
      BEFORE UPDATE ON equipment_hierarchy
      FOR EACH ROW EXECUTE FUNCTION update_equipment_hierarchy_updated_at()
    `);
    console.log('✓ Created trigger: update_equipment_hierarchy_updated_at');

    // Add constraint to ensure level matches parent level + 1
    await query(`
      CREATE OR REPLACE FUNCTION check_equipment_hierarchy_level()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.parent_id IS NOT NULL THEN
          DECLARE
            parent_level INTEGER;
          BEGIN
            SELECT level INTO parent_level FROM equipment_hierarchy WHERE id = NEW.parent_id;
            IF parent_level IS NULL THEN
              RAISE EXCEPTION 'Parent node not found';
            END IF;
            IF NEW.level != parent_level + 1 THEN
              RAISE EXCEPTION 'Level must be parent level + 1';
            END IF;
          END;
        ELSE
          IF NEW.level != 0 THEN
            RAISE EXCEPTION 'Root nodes must have level 0';
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✓ Created function: check_equipment_hierarchy_level');

    // Drop trigger if exists
    try {
      await query(`
        DROP TRIGGER IF EXISTS trigger_check_equipment_hierarchy_level ON equipment_hierarchy
      `);
    } catch (error) {
      // Ignore if trigger doesn't exist
    }

    await query(`
      CREATE TRIGGER trigger_check_equipment_hierarchy_level
      BEFORE INSERT OR UPDATE ON equipment_hierarchy
      FOR EACH ROW EXECUTE FUNCTION check_equipment_hierarchy_level()
    `);
    console.log('✓ Created trigger: trigger_check_equipment_hierarchy_level');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('Rolling back migration: Drop equipment_hierarchy table');

    // Drop triggers
    await query(`DROP TRIGGER IF EXISTS trigger_check_equipment_hierarchy_level ON equipment_hierarchy`);
    console.log('✓ Dropped trigger: trigger_check_equipment_hierarchy_level');

    await query(`DROP TRIGGER IF EXISTS update_equipment_hierarchy_updated_at ON equipment_hierarchy`);
    console.log('✓ Dropped trigger: update_equipment_hierarchy_updated_at');

    // Drop functions
    await query(`DROP FUNCTION IF EXISTS check_equipment_hierarchy_level()`);
    console.log('✓ Dropped function: check_equipment_hierarchy_level');

    await query(`DROP FUNCTION IF EXISTS update_equipment_hierarchy_updated_at()`);
    console.log('✓ Dropped function: update_equipment_hierarchy_updated_at');

    // Drop table
    await query(`DROP TABLE IF EXISTS equipment_hierarchy CASCADE`);
    console.log('✓ Dropped table: equipment_hierarchy');

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
    console.log('Usage: node 004-create-equipment-hierarchy.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
