/**
 * sync_services_to_sidebar_v2.js
 * Synchronizes services and their sub-modules (operations) into the database.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SIDEBAR_SERVICES = [
    { 
        name: 'Permis de Conduire', 
        cat: 'DCPR',
        operations: [
            { name: 'Nouveau permis de conduire', price: 2500 },
            { name: 'Remplacer un permis', price: 1500 },
            { name: 'Corriger un permis', price: 1000 }
        ]
    },
    { 
        name: 'Immatriculation', 
        cat: 'OAVCT',
        operations: [
            { name: 'Immatriculer un véhicule', price: 5000 },
            { name: 'Renouveler l’immatriculation d’un véhicule', price: 3000 },
            { name: 'Remplacer une plaque d’immatriculation', price: 2000 },
            { name: 'Transfert de propriété et renouvellement des plaques', price: 7500 }
        ]
    },
    { 
        name: 'Assurances', 
        cat: 'OAVCT',
        operations: [
            { name: 'Demande d’assurances', price: 3500 },
            { name: 'Consulter un contrat d’assurance', price: 0 },
            { name: 'Renouvellement d\'un contrat d\'assurance', price: 3500 }
        ]
    },
    { 
        name: 'Contraventions', 
        cat: 'DCPR',
        operations: [
            { name: 'Paiement d\'une contravention', price: 1000 },
            { name: 'Contester une contravention', price: 0 }
        ]
    },
    { 
        name: 'Gestion des véhicules', 
        cat: 'DGI',
        operations: []
    }
];

async function run() {
    try {
        await client.connect();
        console.log('Connected.');
        
        for (const s of SIDEBAR_SERVICES) {
            const isActive = s.name !== 'Gestion des véhicules';
            let sId;

            const res = await client.query('SELECT id FROM services WHERE name = $1', [s.name]);
            if (res.rows.length === 0) {
                const insertRes = await client.query(
                    "INSERT INTO \"services\" (\"name\", \"categorie\", \"actif\") VALUES ($1, $2, $3) RETURNING id",
                    [s.name, s.cat, isActive]
                );
                sId = insertRes.rows[0].id;
                console.log(`✓ Added service: ${s.name} (Active: ${isActive})`);
            } else {
                sId = res.rows[0].id;
                await client.query(
                    "UPDATE \"services\" SET \"actif\" = $1, \"categorie\" = $2 WHERE \"id\" = $3",
                    [isActive, s.cat, sId]
                );
                console.log(`✓ Updated service: ${s.name}`);
            }

            // Sync Operations
            if (s.operations) {
                // Optional: mark old operations as inactive or delete? 
                // Let's just upsert
                for (const op of s.operations) {
                    const opRes = await client.query('SELECT id FROM service_operations WHERE name = $1 AND service_id = $2', [op.name, sId]);
                    if (opRes.rows.length === 0) {
                        await client.query(
                            "INSERT INTO service_operations (service_id, name, price, actif) VALUES ($1, $2, $3, TRUE)",
                            [sId, op.name, op.price]
                        );
                        console.log(`  + Op: ${op.name}`);
                    } else {
                        await client.query(
                            "UPDATE service_operations SET price = $1, actif = TRUE WHERE id = $2",
                            [op.price, opRes.rows[0].id]
                        );
                    }
                }
            }
        }
        
        // Linking logic
        const entitySigles = ['OAVCT', 'DGI', 'DCPR', 'MEF'];
        const map = {};
        for(const sigle of entitySigles) {
            const eRes = await client.query('SELECT id FROM entities WHERE sigle = $1', [sigle]);
            map[sigle] = eRes.rows[0]?.id;
        }

        for (const s of SIDEBAR_SERVICES) {
            const sIdRes = await client.query('SELECT id FROM services WHERE name = $1', [s.name]);
            const sId = sIdRes.rows[0]?.id;
            const entId = map[s.cat];
            
            if (sId && entId) {
                const linkRes = await client.query('SELECT 1 FROM entity_services WHERE entity_id = $1 AND service_id = $2', [entId, sId]);
                if (linkRes.rows.length === 0) {
                    await client.query('INSERT INTO entity_services (entity_id, service_id) VALUES ($1, $2)', [entId, sId]);
                    console.log(`✓ Linked ${s.name} to ${s.cat}`);
                }
            }
            // All services visible to MEF
            if (sId && map['MEF']) {
                const linkMef = await client.query('SELECT 1 FROM entity_services WHERE entity_id = $1 AND service_id = $2', [map['MEF'], sId]);
                if (linkMef.rows.length === 0) {
                    await client.query('INSERT INTO entity_services (entity_id, service_id) VALUES ($1, $2)', [map['MEF'], sId]);
                }
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
