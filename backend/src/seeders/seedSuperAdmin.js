/**
 * seedSuperAdmin.js
 * Creates the SuperAdmin user in the local database.
 * Passwords are stored as plain text (matching auth.controller.js logic).
 * Run: node src/seeders/seedSuperAdmin.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
});

const seed = async () => {
    try {
        // 1. Get SuperAdmin role id
        const roleRes = await pool.query(`SELECT id FROM roles WHERE name = 'SuperAdmin' LIMIT 1`);
        if (roleRes.rowCount === 0) {
            throw new Error('Role "SuperAdmin" not found. Run migrations first.');
        }
        const roleId = roleRes.rows[0].id;

        // 2. Get SIAAH HQ office id
        const officeRes = await pool.query(`SELECT id FROM offices WHERE name = 'SIAAH Headquarters' LIMIT 1`);
        if (officeRes.rowCount === 0) {
            throw new Error('Office "SIAAH Headquarters" not found. Run migrations first.');
        }
        const officeId = officeRes.rows[0].id;

        // 3. Insert SuperAdmin (plain text password — matches auth.controller.js)
        const result = await pool.query(`
            INSERT INTO users (first_name, last_name, email, password, role_id, office_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO UPDATE
                SET password  = EXCLUDED.password,
                    role_id   = EXCLUDED.role_id,
                    office_id = EXCLUDED.office_id
            RETURNING id, email, role_id
        `, ['Super', 'Admin', 'admin@siaah.ht', 'Admin@2024!', roleId, officeId]);

        const user = result.rows[0];
        console.log('✅ SuperAdmin seeded successfully:');
        console.log(`   Email    : admin@siaah.ht`);
        console.log(`   Password : Admin@2024!`);
        console.log(`   ID       : ${user.id}  |  Role ID: ${user.role_id}`);
    } catch (err) {
        console.error('❌ Error seeding SuperAdmin:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

seed();
