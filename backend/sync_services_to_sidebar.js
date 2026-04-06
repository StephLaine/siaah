/**
 * sync_services_to_sidebar.js
 * Synchronizes database service names with frontend module labels to ensure sidebar visibility for Entity Admins.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SIDEBAR_SERVICES = [
    { name: 'Immatriculation', cat: 'OAVCT' },
    { name: 'Permis de Conduire', cat: 'DCPR' },
    { name: 'Assurances', cat: 'OAVCT' },
    { name: 'Contraventions', cat: 'DCPR' },
    { name: 'Gestion des véhicules', cat: 'DGI' }
];

async function run() {
    try {
        await client.connect();
        console.log('Connected.');
        
        console.log('Upgrading service names to match sidebar labels...');
        for (const s of SIDEBAR_SERVICES) {
            // Upsert with correct casing and spelling
            await client.query(
                "INSERT INTO \"services\" (\"name\", \"categorie\", \"actif\", \"required_documents\") VALUES ($1, $2, TRUE, '[]') ON CONFLICT (\"name\") DO NOTHING",
                [s.name, s.cat]
            );
        }
        
        // Final link for OAVCT entity (MEF should also see them?)
        const oavctRes = await client.query('SELECT id FROM entities WHERE sigle = \'OAVCT\'');
        const dgiRes = await client.query('SELECT id FROM entities WHERE sigle = \'DGI\'');
        const dcprRes = await client.query('SELECT id FROM entities WHERE sigle = \'DCPR\'');
        const mefRes = await client.query('SELECT id FROM entities WHERE sigle = \'MEF\'');

        const map = { 'OAVCT': oavctRes.rows[0]?.id, 'DGI': dgiRes.rows[0]?.id, 'DCPR': dcprRes.rows[0]?.id, 'MEF': mefRes.rows[0]?.id };

        for (const s of SIDEBAR_SERVICES) {
            const sIdRes = await client.query('SELECT id FROM services WHERE name = $1', [s.name]);
            const sId = sIdRes.rows[0]?.id;
            const entId = map[s.cat];
            if (sId && entId) {
                await client.query('INSERT INTO entity_services (entity_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [entId, sId]);
                console.log(`✓ Linked ${s.name} to ${s.cat}`);
            }
            // MEF admin should probably see everything!
            if (sId && map['MEF']) {
                await client.query('INSERT INTO entity_services (entity_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [map['MEF'], sId]);
            }
        }

        console.log('Sync complete.');
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await client.end();
    }
}
run();
