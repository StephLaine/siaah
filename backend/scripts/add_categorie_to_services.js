require('dotenv').config({ path: __dirname + '/../.env' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await client.connect();
    console.log('🔧 Adding column "categorie" to services if missing...');
    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS categorie VARCHAR(100);
    `);
    console.log('✅ Column added/verified.');
    // Optionally set a default category for core services
    const coreNames = ['Immatriculation', 'Permis de conduire', 'Assurance', 'Contravention'];
    await client.query(
      `UPDATE services SET categorie = 'Core' WHERE name = ANY($1::text[]) AND categorie IS NULL`,
      [coreNames]
    );
    console.log('✅ Core services categorie set to "Core" where needed.');
  } catch (err) {
    console.error('❌ Error adding categorie column:', err);
  } finally {
    await client.end();
    console.log('🔚 Migration finished.');
  }
})();
