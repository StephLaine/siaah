require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function debug() {
    await client.connect();
    console.log('Connected.');
    try {
        console.log('Checking roles table...');
        const res = await client.query('SELECT * FROM "roles"');
        console.log('Roles found:', res.rows.length);
        
        console.log('Attempting simple insert...');
        await client.query("INSERT INTO \"roles\" (\"name\") VALUES ('TestRole') ON CONFLICT DO NOTHING");
        console.log('Simple insert success.');
        
        await client.query("DELETE FROM \"roles\" WHERE \"name\" = 'TestRole'");
        console.log('Delete success.');
        
    } catch (e) {
        console.error('DB ERROR:', e.message);
        console.error(e);
    } finally {
        await client.end();
    }
}
debug();
