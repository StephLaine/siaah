const { pool } = require('../src/config/db');

async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'offices'");
    console.log('Offices columns:', res.rows.map(r => r.column_name));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

check();
