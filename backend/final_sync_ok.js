/**
 * final_patch_v2.js
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected.');

        console.log('Patching schema (offices unique name)...');
        try {
            await client.query('ALTER TABLE "offices" ADD CONSTRAINT "offices_name_key" UNIQUE ("name")');
            console.log('✓ Uniqueness enforced.');
        } catch (e) {
            console.log('· Already unique or skipped.');
        }

        const seeds = [
            // Entities
            "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Ministère de l''Économie et des Finances', 'MEF', 'Ministère', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
            "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Direction Générale des Impôts', 'DGI', 'Direction', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
            "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Office Assurance Véhicules Contre Tiers', 'OAVCT', 'Office', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
            "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Direction de la Circulation et de la Police Routière', 'DCPR', 'Direction', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
            
            // Offices
            "INSERT INTO \"offices\" (\"name\", \"type\", \"statut\") VALUES ('Siège MEF', 'GLOBAL', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
            
            // License Categories
            "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('A', 'Catégorie A : Motocyclette', 'Motos') ON CONFLICT (\"code\") DO NOTHING",
            "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('B', 'Catégorie B : Véhicule léger (voiture)', 'Voitures') ON CONFLICT (\"code\") DO NOTHING",
            "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('C', 'Catégorie C : Camion', 'Camions') ON CONFLICT (\"code\") DO NOTHING",
            "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('D', 'Catégorie D : Transport en commun', 'Bus') ON CONFLICT (\"code\") DO NOTHING",
            "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('E', 'Catégorie E : Véhicule avec remorque', 'Remorques') ON CONFLICT (\"code\") DO NOTHING"
        ];

        console.log('Seeding metadata...');
        for (const s of seeds) {
            await client.query(s);
        }

        console.log('Finalizing SuperAdmin...');
        const roleRes = await client.query("SELECT \"id\" FROM \"roles\" WHERE \"name\" = 'SuperAdmin'");
        if (roleRes.rows.length > 0) {
            const roleId = roleRes.rows[0].id;
            await client.query(`
                INSERT INTO "users" ("first_name", "last_name", "email", "password", "role_id", "is_active")
                VALUES ('Super', 'Admin', 'superadmin@siaah.ht', 'SuperAdmin@2024!', $1, TRUE)
                ON CONFLICT ("email") DO UPDATE SET "role_id" = EXCLUDED."role_id"
            `, [roleId]);
            console.log('✓ SuperAdmin ready.');
        }

        console.log('\nFULL SYSTEM SYNC SUCCESSFUL.');
    } catch (err) {
        console.error('\nERROR:', err.message);
    } finally {
        await client.end();
    }
}

run();
