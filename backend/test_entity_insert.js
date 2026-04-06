require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function test_entities() {
    await client.connect();
    console.log('Connected.');
    try {
        const e = { name: "Ministère de l'Économie et des Finances", sigle: 'MEF', type: 'Ministère' };
        
        console.log('Inserting entity...');
        // Standard parameterized query is MUCH SAFER than template strings for values
        await client.query(
            'INSERT INTO "entities" ("name", "sigle", "type_entite") VALUES ($1, $2, $3) ON CONFLICT ("name") DO NOTHING',
            [e.name, e.sigle, e.type]
        );
        console.log('Success.');
        
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await client.end();
    }
}
test_entities();
