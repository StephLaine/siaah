require('dotenv').config({ path: __dirname + '/../.env' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const corePublicNames = ['Immatriculation', 'Permis de conduire', 'Assurance', 'Contravention'];

(async () => {
  try {
    await client.connect();
    console.log('🔧 Adding column is_public to services if missing...');
    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Column added/verified.');

    console.log('🔄 Updating core services to be public...');
    await client.query(
      `UPDATE services SET is_public = TRUE WHERE name = ANY($1::text[])`,
      [corePublicNames]
    );
    console.log('✅ Core services updated.');
  } catch (err) {
    console.error('❌ Error during migration:', err);
  } finally {
    await client.end();
    console.log('🔚 Migration script finished.');
  }
})();
