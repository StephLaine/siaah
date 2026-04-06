const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function checkSchema() {
  try {
    const tables = ['users', 'vehicles'];
    for (const table of tables) {
      const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}'
        ORDER BY ordinal_position
      `);
      console.log(`Table: ${table}`);
      console.table(res.rows);
    }

    // Check if NIF is unique in users
    const nifRes = await pool.query(`
        SELECT conname, contype 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass AND conname LIKE '%nif%'
    `);
    console.log("NIF Constraints:");
    console.table(nifRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
