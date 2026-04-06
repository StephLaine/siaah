const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function runMigrations() {
  try {
    // 1. Create Lookup Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicle_makes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicle_models (
        id SERIAL PRIMARY KEY,
        make_id INTEGER REFERENCES vehicle_makes(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (make_id, name)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicle_colors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        hex_code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Modify Vehicles table
    // Ensure license_plate is unique
    await pool.query(`
      ALTER TABLE vehicles 
      DROP CONSTRAINT IF EXISTS vehicles_license_plate_key,
      ADD CONSTRAINT vehicles_license_plate_key UNIQUE (license_plate)
    `);

    // 3. Insert some default data
    const makes = ['Toyota', 'Honda', 'Suzuki', 'Nissan', 'Ford', 'BMW', 'Mercedes-Benz'];
    for (const make of makes) {
      await pool.query("INSERT INTO vehicle_makes (name) VALUES ($1) ON CONFLICT DO NOTHING", [make]);
    }

    const defaultColors = ['Blanc', 'Noir', 'Gris', 'Rouge', 'Bleu', 'Gris Argenté', 'Vert'];
    for (const color of defaultColors) {
      await pool.query("INSERT INTO vehicle_colors (name) VALUES ($1) ON CONFLICT DO NOTHING", [color]);
    }

    console.log("Migrations successfully applied.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await pool.end();
  }
}

runMigrations();
