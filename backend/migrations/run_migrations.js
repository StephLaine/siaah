require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function runMigrations() {
  try {
    await client.connect();
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Executing migration ${file}`);
      await client.query(sql);
    }
    console.log('All migrations executed.');
  } catch (e) {
    console.error('Migration error:', e);
  } finally {
    await client.end();
  }
}

runMigrations();
