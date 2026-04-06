const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

async function checkTable() {
  try {
    const res = await pool.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'vehicles'");
    console.log('Vehicles table count:', res.rows[0].count);
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Existing tables:', tables.rows.map(r => r.table_name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTable();
