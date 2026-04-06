const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

async function checkVehiclesSchema() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'vehicles'
        `);
        console.log('--- Vehicles Schema ---');
        res.rows.forEach(row => console.log(` - ${row.column_name}: ${row.data_type}`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkVehiclesSchema();
