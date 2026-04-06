const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

async function checkTables() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables found:');
        res.rows.forEach(row => console.log(' - ' + row.table_name));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkTables();
