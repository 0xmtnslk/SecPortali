/**
 * Migration: Add order field to asset_categories table
 * 
 * This migration adds the following fields to the asset_categories table:
 * - order: INTEGER - for sorting categories in hierarchical order
 * - updated_at: TIMESTAMP - for tracking updates
 * 
 * Also adds an index on parent_id for better performance in hierarchical queries
 */

const { query } = require('../../src/config/database');

async function up() {
  try {
    console.log('Starting migration: Add equipment categories order field');

    // Add order column if it doesn't exist
    try {
      await query(`ALTER TABLE asset_categories ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0`);
      console.log('✓ Added column: order');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('- Column already exists: order');
      } else {
        console.error('✗ Error adding column order:', error.message);
      }
    }

    // Add updated_at column if it doesn't exist
    try {
      await query(`ALTER TABLE asset_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      console.log('✓ Added column: updated_at');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('- Column already exists: updated_at');
      } else {
        console.error('✗ Error adding column updated_at:', error.message);
      }
    }

    // Create index on parent_id for better hierarchical query performance
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_asset_categories_parent_id ON asset_categories(parent_id)`);
      console.log('✓ Created index: idx_asset_categories_parent_id');
    } catch (error) {
      console.error('✗ Error creating index:', error.message);
    }

    // Create index on order for better sorting performance
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_asset_categories_order ON asset_categories("order")`);
      console.log('✓ Created index: idx_asset_categories_order');
    } catch (error) {
      console.error('✗ Error creating index:', error.message);
    }

    // Create trigger for updated_at if it doesn't exist
    try {
      await query(`
        CREATE TRIGGER IF NOT EXISTS update_asset_categories_updated_at
        BEFORE UPDATE ON asset_categories
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✓ Created trigger: update_asset_categories_updated_at');
    } catch (error) {
      console.error('✗ Error creating trigger:', error.message);
    }

    // Initialize order values for existing categories
    try {
      await query(`
        UPDATE asset_categories 
        SET "order" = subquery.row_num
        FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY name) as row_num
          FROM asset_categories
          WHERE "order" = 0 OR "order" IS NULL
        ) subquery
        WHERE asset_categories.id = subquery.id
      `);
      console.log('✓ Initialized order values for existing categories');
    } catch (error) {
      console.error('✗ Error initializing order values:', error.message);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('Rolling back migration: Remove equipment categories order field');

    // Drop trigger
    try {
      await query(`DROP TRIGGER IF EXISTS update_asset_categories_updated_at ON asset_categories`);
      console.log('✓ Dropped trigger: update_asset_categories_updated_at');
    } catch (error) {
      console.error('✗ Error dropping trigger:', error.message);
    }

    // Drop indexes
    const indexes = [
      'idx_asset_categories_order',
      'idx_asset_categories_parent_id'
    ];

    for (const index of indexes) {
      try {
        await query(`DROP INDEX IF EXISTS ${index}`);
        console.log(`✓ Dropped index: ${index}`);
      } catch (error) {
        console.error(`✗ Error dropping index ${index}:`, error.message);
      }
    }

    // Drop columns
    const columns = [
      'updated_at',
      'order'
    ];

    for (const column of columns) {
      try {
        await query(`ALTER TABLE asset_categories DROP COLUMN IF EXISTS ${column}`);
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
    console.log('Usage: node 003-add-equipment-categories-order.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
