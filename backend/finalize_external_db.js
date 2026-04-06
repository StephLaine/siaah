/**
 * finalize_external_db.js
 * Final seeds for SIAAH using safe quoted identifiers.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SEEDS = [
    // Entities
    "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Ministère de l''Économie et des Finances', 'MEF', 'Ministère', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
    "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Direction Générale des Impôts', 'DGI', 'Direction', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
    "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Office Assurance Véhicules Contre Tiers', 'OAVCT', 'Office', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
    "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Direction de la Circulation et de la Police Routière', 'DCPR', 'Direction', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
    
    // Default Office
    "INSERT INTO \"offices\" (\"name\", \"type\", \"statut\") VALUES ('Siège MEF', 'GLOBAL', 'Actif') ON CONFLICT DO NOTHING",
    
    // License Categories
    "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('A', 'Catégorie A : Motocyclette', 'Motos'), ('B', 'Catégorie B : Véhicule léger (voiture)', 'Voitures'), ('C', 'Catégorie C : Camion', 'Camions'), ('D', 'Catégorie D : Transport en commun', 'Bus'), ('E', 'Catégorie E : Véhicule avec remorque', 'Remorques') ON CONFLICT (\"code\") DO NOTHING"
];

async function run() {
    try {
        await client.connect();
        console.log('Seeding metadata...');
        for (const s of SEEDS) {
            await client.query(s);
        }
        
        console.log('Ensuring SuperAdmin user...');
        const roleRes = await client.query("SELECT \"id\" FROM \"roles\" WHERE \"name\" = 'SuperAdmin'");
        if (roleRes.rows.length > 0) {
            const roleId = roleRes.rows[0].id;
            await client.query(`
                INSERT INTO "users" ("first_name", "last_name", "email", "password", "role_id", "is_active")
                VALUES ('Super', 'Admin', 'superadmin@siaah.ht', 'SuperAdmin@2024!', $1, TRUE)
                ON CONFLICT ("email") DO UPDATE SET "role_id" = EXCLUDED."role_id", "is_active" = TRUE
            `, [roleId]);
        }
        
        console.log('Success: Full system is now synced on external DB.');
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await client.end();
    }
}
run();
