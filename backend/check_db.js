const { pool } = require('./src/config/db');

async function checkData() {
  try {
    const res = await pool.query('SELECT DISTINCT status FROM service_requests');
    console.log('Current statuses in DB:', res.rows.map(r => r.status));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
