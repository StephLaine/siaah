// src/config/migrate.js
// Migration script that ensures the target database exists before applying schema.
// Works with Render PostgreSQL DATABASE_URL (SSL required) and local dev setups.

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Helper to create a PostgreSQL client based on environment configuration
function createClient(database) {
  // If a full DATABASE_URL is provided, adjust its path to the desired database.
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    url.pathname = `/${database}`;
    return new Client({
      connectionString: url.toString(),
      // Render requires SSL; allow self-signed for development.
      ssl: { rejectUnauthorized: false },
    });
  }

  // Fallback to individual connection parameters.
  return new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT || 5432,
    database,
  });
}

// Determine the target database name.
const targetDatabase = process.env.DB_NAME || (process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).pathname.slice(1) : null);
if (!targetDatabase) {
  console.error('No database name configured. Set DB_NAME or provide DATABASE_URL.');
  process.exit(1);
}

const seedDatabase = async () => {
// Connect to the "postgres" database first to ensure the target DB exists
  const adminClient = createClient('postgres');

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL admin server');

    // Check if the target database exists
    const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = '${targetDatabase}'`);
    if (res.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${targetDatabase}`);
      console.log(`Database ${targetDatabase} created`);
    } else {
      console.log(`Database ${targetDatabase} already exists`);
    }
    await adminClient.end();

    // Connect to the target database for schema and seed execution
    const client = createClient(targetDatabase);
    await client.connect();
    console.log(`Connected to database ${targetDatabase}`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('Database schema and seed data applied successfully');

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
