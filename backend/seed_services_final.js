/**
 * seed_services.js
 * Comprehensive services seeding for SIAAH.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SERVICES = [
    { name: 'Immatriculation', categorie: 'OAVCT', desc: "Service d'immatriculation de véhicules" },
    { name: 'Permis de conduire', categorie: 'DCPR', desc: 'Service des permis de conduire' },
    { name: 'Assurance OAVCT', categorie: 'OAVCT', desc: 'Assurance contre tiers' },
    { name: "Contraventions", categorie: 'DCPR', desc: 'Gestion des amendes et contraventions' },
    { name: 'Quitus Fiscal', categorie: 'DGI', desc: 'Service des impôts' },
    { name: 'Déclaration de revenus', categorie: 'DGI', desc: 'Service des impôts' }
];

async function run() {
    try {
        await client.connect();
        console.log('Seeding services...');
        for (const s of SERVICES) {
            const res = await client.query('SELECT 1 FROM \"services\" WHERE \"name\" = $1', [s.name]);
            if (res.rows.length === 0) {
                await client.query(
                    'INSERT INTO \"services\" (\"name\", \"categorie\", \"description\", \"actif\", \"required_documents\") VALUES ($1, $2, $3, TRUE, \'[]\')',
                    [s.name, s.categorie, s.desc]
                );
                console.log(`✓ Seeded service: ${s.name}`);
            }
        }
        
        // Associate entities to services
        console.log('Associating services to entities...');
        // OAVCT entity matches OAVCT category
        const entitiesRes = await client.query('SELECT \"id\", \"sigle\" FROM \"entities\"');
        const servicesRes = await client.query('SELECT \"id\", \"name\", \"categorie\" FROM \"services\"');
        
        for (const s of servicesRes.rows) {
            const ent = entitiesRes.rows.find(e => e.sigle === s.categorie);
            if (ent) {
                await client.query(
                    'INSERT INTO \"entity_services\" (\"entity_id\", \"service_id\") VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [ent.id, s.id]
                );
            }
        }
        
        console.log('Services ready.');
    } catch (e) {
        console.error('Error seeding services:', e.message);
    } finally {
        await client.end();
    }
}
run();
