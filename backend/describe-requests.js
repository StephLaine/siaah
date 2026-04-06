const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

async function describeTable() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'service_requests'
        `);
        console.log('---START---');
        res.rows.forEach(row => {
            console.log(JSON.stringify(row));
        });
        console.log('---END---');
    } catch (err) {
        console.warn('Error:', err.message);
    } finally {
        await pool.end();
    }
}

describeTable();
