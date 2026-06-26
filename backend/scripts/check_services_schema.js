require('dotenv').config({ path: __dirname + '/../.env' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'services'
      ORDER BY ordinal_position;
    `);
    console.log('🚧 Services table schema:');
    console.table(res.rows);
  } catch (err) {
    console.error('❌ Error fetching services schema:', err);
  } finally {
    await client.end();
  }
})();
