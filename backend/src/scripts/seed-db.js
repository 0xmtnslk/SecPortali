const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const seedDatabase = async () => {
  console.log('Starting manual database seeding...');
  const client = await pool.connect();
  
  try {
    const seedFiles = [
      '01-init-schema.sql',
      '02-seed-data.sql',
      '03-seed-equipment-hierarchy.sql',
      '04-add-is-active-to-related-tables.sql'
    ];

    for (const file of seedFiles) {
      const filePath = path.join(__dirname, '../../database/init', file);
      if (fs.existsSync(filePath)) {
        console.log(`Executing ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        // Split by semicolon to execute one by one if needed, but pg can handle some multi-statements
        // However, standard pg pool.query(sql) handles multi-statements in a single string.
        await client.query(sql);
        console.log(`${file} executed successfully.`);
      } else {
        console.warn(`Seed file not found: ${filePath}`);
      }
    }

    console.log('Database seeding completed successfully.');
  } catch (err) {
    console.error('Error during database seeding:', err);
    throw err;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
