/**
 * seed_services_v2.js
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SERVICES = [
    { name: 'Immatriculation', cat: 'OAVCT', desc: 'Véhicules' },
    { name: 'Permis', cat: 'DCPR', desc: 'Drivers' },
    { name: 'Assurance', cat: 'OAVCT', desc: 'Risk' }
];

async function run() {
    try {
        await client.connect();
        console.log('Connected.');
        
        for (const s of SERVICES) {
            await client.query(
                "INSERT INTO \"services\" (\"name\", \"categorie\", \"description\") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
                [s.name, s.cat, s.desc]
            );
        }
        console.log('Services seeded.');
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await client.end();
    }
}
run();
