require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function test() {
    await client.connect();
    console.log('Connected.');
    try {
        console.log('Inserting into offices...');
        // Try a regular insert first
        await client.query("INSERT INTO offices (name, type, statut) VALUES ('Siège MEF', 'GLOBAL', 'Actif') ON CONFLICT DO NOTHING");
        console.log('Success.');
    } catch (e) {
        console.error('FAILED:', e.message);
        console.error(e);
    } finally {
        await client.end();
    }
}
test();
