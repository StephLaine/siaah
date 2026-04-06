/**
 * final_patch.js
 */
require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function patch() {
    await client.connect();
    console.log('Patching schema...');
    try {
        // Enforce uniqueness on office names if not exists
        await client.query('ALTER TABLE "offices" ADD CONSTRAINT "offices_name_key" UNIQUE ("name")');
        console.log('✓ Offices name unique constraint added.');
    } catch (e) {
        console.log('· Offices name uniqueness already enforced or skipped.');
    }
    
    console.log('Seeding metadata...');
    const seeds = [
        "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Ministère de l''Économie et des Finances', 'MEF', 'Ministère', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
        "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Direction Générale des Impôts', 'DGI', 'Direction', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
        "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Office Assurance Véhicules Contre Tiers', 'OAVCT', 'Office', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
        "INSERT INTO \"entities\" (\"name\", \"sigle\", \"type_entite\", \"statut\") VALUES ('Direction de la Circulation et de la Police Routière', 'DCPR', 'Direction', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
        
        "INSERT INTO \"offices\" (\"name\", \"type\", \"statut\") VALUES ('Siège MEF', 'GLOBAL', 'Actif') ON CONFLICT (\"name\") DO NOTHING",
        
        "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('A', 'Catégorie A : Motocyclette', 'Motos') ON CONFLICT (\"code\") DO NOTHING",
        "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('B', 'Catégorie B : Véhicule léger (voiture)', 'Voitures') ON CONFLICT (\"code\") DO NOTHING",
        "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('C', 'Catégorie C : Camion', 'Camions') ON CONFLICT (\"code\") DO NOTHING",
        "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('D', 'Catégorie D : Transport en commun', 'Bus') ON CONFLICT (\"code\") DO NOTHING",
        "INSERT INTO \"license_categories\" (\"code\", \"name\", \"description\") VALUES ('E', 'Catégorie E : Véhicule avec remorque', 'Remorques') ON CONFLICT (\"code\") DO NOTHING"
    ];
    
    for (const s of seeds) {
        await client.query(s);
    }
    
    console.log('Seeding SuperAdmin...');
    const roleRes = await client.query("SELECT \"id\" FROM \"roles\" WHERE \"name\" = 'SuperAdmin'");
    if (roleRes.rows.length > 0) {
        const roleId = roleRes.rows[0].id;
        await client.query(`
            INSERT INTO "users" ("first_name", "last_name", "email", "password", "role_id", "is_active")
            VALUES ('Super', 'Admin', 'superadmin@siaah.ht', 'SuperAdmin@2024!', $1, TRUE)
            ON CONFLICT ("email") DO UPDATE SET "role_id" = EXCLUDED."role_id"
        `, [roleId]);
        console.log('✓ SuperAdmin user ready.');
    }
    
    console.log('DONE.');
} catch (e) {
    console.error('Error in final_patch:', e.message);
} finally {
    await client.end();
}
patch();
