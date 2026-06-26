require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations(attempt = 1) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Executing migration ${file}`);
      await client.query(sql);
    }
    console.log('✅ All migrations executed successfully.');
  } catch (e) {
    console.error(`Migration error (attempt ${attempt}):`, e.message);
    if ((e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT') && attempt < 4) {
      console.log(`⏳ Retrying in 3s... (attempt ${attempt + 1}/4)`);
      await new Promise(r => setTimeout(r, 3000));
      return runMigrations(attempt + 1);
    }
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

runMigrations();
