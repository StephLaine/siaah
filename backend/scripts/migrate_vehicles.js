const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

async function migrateVehicles() {
  try {
    // Add missing columns if they don't exist
    await pool.query(`
      ALTER TABLE vehicles 
      ADD COLUMN IF NOT EXISTS engine_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS seats_count INTEGER,
      ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
    `);
    
    console.log('Vehicles table migrated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateVehicles();
