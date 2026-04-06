/**
 * final_sync_safe.js
 * A more manual but robust approach to seeding without ON CONFLICT dependencies.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function safeSeed(table, column, value, sql) {
    try {
        const res = await client.query(`SELECT 1 FROM "${table}" WHERE "${column}" = $1`, [value]);
        if (res.rows.length === 0) {
            console.log(`- Inserting ${value} into ${table}...`);
            await client.query(sql);
        } else {
            console.log(`· ${value} already exists in ${table}.`);
        }
    } catch (e) {
        console.error(`! Failed on ${value} for ${table}:`, e.message);
    }
}

async function run() {
    try {
        await client.connect();
        console.log('Connected to External DB.');

        // 1. Tables check (just in case they don't exist)
        console.log('Verifying tables (Quoted)...');
        await client.query('CREATE TABLE IF NOT EXISTS "entities" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(255) NOT NULL UNIQUE, "sigle" VARCHAR(30), "type_entite" VARCHAR(50), "statut" VARCHAR(20) DEFAULT \'Actif\')');
        await client.query('CREATE TABLE IF NOT EXISTS "offices" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(100) NOT NULL UNIQUE, "type" VARCHAR(20), "statut" VARCHAR(30) DEFAULT \'Actif\')');
        await client.query('CREATE TABLE IF NOT EXISTS "license_categories" ("id" SERIAL PRIMARY KEY, "code" VARCHAR(10) NOT NULL UNIQUE, "name" VARCHAR(255), "description" TEXT)');
        await client.query('CREATE TABLE IF NOT EXISTS "roles" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(50) NOT NULL UNIQUE)');
        await client.query('CREATE TABLE IF NOT EXISTS "users" ("id" SERIAL PRIMARY KEY, "first_name" VARCHAR(100), "last_name" VARCHAR(100), "email" VARCHAR(100) NOT NULL UNIQUE, "password" VARCHAR(255) NOT NULL, "role_id" INT, "is_active" BOOLEAN DEFAULT TRUE)');

        // 2. Roles
        const roles = ['SuperAdmin', 'Admin', 'Employee', 'Agent Immatriculation', 'Agent Assurance', 'Agent Permis', 'Agent Routier', 'User'];
        for (const r of roles) {
            await safeSeed('roles', 'name', r, `INSERT INTO "roles" ("name") VALUES ('${r}')`);
        }

        // 3. Entities
        const entities = [
            { name: 'Ministère de l''Économie et des Finances', sigle: 'MEF', type: 'Ministère' },
            { name: 'Direction Générale des Impôts', sigle: 'DGI', type: 'Direction' },
            { name: 'Office Assurance Véhicules Contre Tiers', sigle: 'OAVCT', type: 'Office' },
            { name: 'Direction de la Circulation et de la Police Routière', sigle: 'DCPR', type: 'Direction' }
        ];
        for (const e of entities) {
            await safeSeed('entities', 'name', e.name, `INSERT INTO "entities" ("name", "sigle", "type_entite") VALUES ('${e.name.replace(/'/g, "''")}', '${e.sigle}', '${e.type}')`);
        }

        // 4. Offices
        await safeSeed('offices', 'name', 'Siège MEF', `INSERT INTO "offices" ("name", "type") VALUES ('Siège MEF', 'GLOBAL')`);

        // 5. License Categories
        const cats = [
            { code: 'A', name: 'Catégorie A : Motocyclette' },
            { code: 'B', name: 'Catégorie B : Véhicule léger (voiture)' },
            { code: 'C', name: 'Catégorie C : Camion' },
            { code: 'D', name: 'Catégorie D : Transport en commun' },
            { code: 'E', name: 'Catégorie E : Véhicule avec remorque' }
        ];
        for (const c of cats) {
            await safeSeed('license_categories', 'code', c.code, `INSERT INTO "license_categories" ("code", "name") VALUES ('${c.code}', '${c.name.replace(/'/g, "''")}')`);
        }

        // 6. SuperAdmin
        console.log('Ensuring SuperAdmin...');
        const roleRes = await client.query("SELECT \"id\" FROM \"roles\" WHERE \"name\" = 'SuperAdmin'");
        if (roleRes.rows.length > 0) {
            const roleId = roleRes.rows[0].id;
            const userRes = await client.query("SELECT 1 FROM \"users\" WHERE \"email\" = 'superadmin@siaah.ht'");
            if (userRes.rows.length === 0) {
                await client.query(`
                    INSERT INTO "users" ("first_name", "last_name", "email", "password", "role_id", "is_active")
                    VALUES ('Super', 'Admin', 'superadmin@siaah.ht', 'SuperAdmin@2024!', $1, TRUE)
                `, [roleId]);
                console.log('✓ SuperAdmin created.');
            } else {
                console.log('· SuperAdmin already exists.');
            }
        }

        console.log('\nSUCCESS: Database External is fully prepared.');

    } catch (e) {
        console.error('\nCRITICAL ERROR:', e.message);
    } finally {
        await client.end();
    }
}

run();
