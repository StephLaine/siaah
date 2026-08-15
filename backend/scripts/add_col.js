const { pool } = require('../src/config/db');

async function run() {
  try {
    await pool.query('ALTER TABLE communications ADD COLUMN type VARCHAR(50)');
    console.log('Column added');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists, ignoring');
    } else {
      console.error(err);
    }
  } finally {
    pool.end();
  }
}

run();
