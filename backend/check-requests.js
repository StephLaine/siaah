const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'siaah_db',
  password: 'password123',
  port: 5432,
});

async function checkRequests() {
  try {
    const res = await pool.query('SELECT id, type, details FROM service_requests ORDER BY id DESC LIMIT 5');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkRequests();
