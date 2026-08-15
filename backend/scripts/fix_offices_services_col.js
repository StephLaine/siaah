const { pool } = require('../src/config/db');

async function run() {
  try {
    await pool.query("ALTER TABLE offices ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'");
    console.log('Successfully added services column to offices table');
  } catch (err) {
    console.error('Error adding services column:', err);
  } finally {
    pool.end();
  }
}

run();
