const { pool } = require('./src/config/db');

async function checkSchema() {
  try {
    const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'service_requests' 
        AND column_name = 'details';
    `);
    console.log('DETAILS COLUMN TYPE:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkSchema();
