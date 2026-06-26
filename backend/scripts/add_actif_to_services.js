require('dotenv').config({ path: __dirname + '/../.env' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await client.connect();
    console.log('🔧 Adding column actif to services if missing...');
    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT TRUE;
    `);
    console.log('✅ Column actif added/verified.');
  } catch (err) {
    console.error('❌ Error during migration:', err);
  } finally {
    await client.end();
    console.log('🔚 Migration script finished.');
  }
})();
