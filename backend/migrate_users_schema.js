const { pool } = require('./src/config/db');

async function migrate() {
    try {
        console.log("Starting migration: Updating users table schema...");
        
        const sql = `
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS sexe VARCHAR(20),
            ADD COLUMN IF NOT EXISTS dob DATE,
            ADD COLUMN IF NOT EXISTS pob VARCHAR(255),
            ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
            ADD COLUMN IF NOT EXISTS cin VARCHAR(50),
            ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50),
            ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
            ADD COLUMN IF NOT EXISTS city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS department VARCHAR(100),
            ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Haiti',
            ADD COLUMN IF NOT EXISTS full_address TEXT,
            ADD COLUMN IF NOT EXISTS phone2 VARCHAR(50),
            ADD COLUMN IF NOT EXISTS photo TEXT;
        `;
        
        await pool.query(sql);
        console.log("Migration successful: users table schema updated.");
        
    } catch (err) {
        console.error("Migration fatal error:", err);
    } finally {
        pool.end();
    }
}

migrate();
