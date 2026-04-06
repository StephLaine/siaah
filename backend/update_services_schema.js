const { pool } = require('./src/config/db');

async function updateSchema() {
    try {
        console.log('Updating services table to include required_documents...');
        await pool.query(`
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS required_documents JSONB DEFAULT '[]'
        `);
        console.log('Schema updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
