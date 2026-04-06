/**
 * db_final_complete.js
 * The DEFINITIVE production-ready seed for SIAAH External DB.
 * Uses parameterized queries for reliability and safety.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function safeInsert(table, column, value, insertSql, params) {
    try {
        const res = await client.query(`SELECT 1 FROM "${table}" WHERE "${column}" = $1`, [value]);
        if (res.rows.length === 0) {
            console.log(`- Inserting into ${table}: ${value}`);
            await client.query(insertSql, params);
        } else {
            console.log(`· Skipping ${table}: ${value} (already exists)`);
        }
    } catch (e) {
        console.error(`! Failed on ${value} for ${table}:`, e.message);
    }
}

async function run() {
    try {
        await client.connect();
        console.log('--- SIAAH REAL-TIME SYNC ---');

        // 1. Core Categories
        const roles = ['SuperAdmin', 'Admin', 'Employee', 'Agent Immatriculation', 'Agent Assurance', 'Agent Permis', 'Agent Routier', 'User'];
        for (const r of roles) {
            await safeInsert('roles', 'name', r, 'INSERT INTO "roles" ("name") VALUES ($1)', [r]);
        }

        const entities = [
            { name: "Ministère de l'Économie et des Finances", sigle: 'MEF', type: 'Ministère' },
            { name: "Direction Générale des Impôts", sigle: 'DGI', type: 'Direction' },
            { name: "Office Assurance Véhicules Contre Tiers", sigle: 'OAVCT', type: 'Office' },
            { name: "Direction de la Circulation et de la Police Routière", sigle: 'DCPR', type: 'Direction' }
        ];
        for (const e of entities) {
            await safeInsert('entities', 'name', e.name, 'INSERT INTO "entities" ("name", "sigle", "type_entite") VALUES ($1, $2, $3)', [e.name, e.sigle, e.type]);
        }

        // Default Office (Siège MEF) needs entity_id?
        const mefRes = await client.query('SELECT id FROM "entities" WHERE "sigle" = \'MEF\'');
        const mefId = mefRes.rows[0]?.id;
        await safeInsert('offices', 'name', 'Siège MEF', 'INSERT INTO "offices" ("name", "type", "entity_id") VALUES ($1, $2, $3)', ['Siège MEF', 'GLOBAL', mefId]);

        const cats = [
            { code: 'A', name: 'Catégorie A : Motocyclette' },
            { code: 'B', name: 'Catégorie B : Véhicule léger (voiture)' },
            { code: 'C', name: 'Catégorie C : Camion' },
            { code: 'D', name: 'Catégorie D : Transport en commun' },
            { code: 'E', name: 'Catégorie E : Véhicule avec remorque' }
        ];
        for (const c of cats) {
            await safeInsert('license_categories', 'code', c.code, 'INSERT INTO "license_categories" ("code", "name") VALUES ($1, $2)', [c.code, c.name]);
        }

        // 2. SuperAdmin
        console.log('--- Admin Provisioning ---');
        const roleRes = await client.query("SELECT \"id\" FROM \"roles\" WHERE \"name\" = 'SuperAdmin'");
        if (roleRes.rows.length > 0) {
            const roleId = roleRes.rows[0].id;
            const superEmail = 'superadmin@siaah.ht';
            const userRes = await client.query('SELECT 1 FROM "users" WHERE "email" = $1', [superEmail]);
            if (userRes.rows.length === 0) {
                await client.query(`
                    INSERT INTO "users" ("first_name", "last_name", "email", "password", "role_id", "is_active")
                    VALUES ('Super', 'Admin', $1, 'SuperAdmin@2024!', $2, TRUE)
                `, [superEmail, roleId]);
                console.log('✓ SuperAdmin created: ' + superEmail);
            } else {
                console.log('· SuperAdmin already exists.');
            }
        }

        console.log('\n=====================================');
        console.log(' DATABASE EXTERNAL READY FOR ACTION ');
        console.log('=====================================\n');

    } catch (e) {
        console.error('CRITICAL SYNC FAILURE:', e.message);
    } finally {
        await client.end();
    }
}

run();
