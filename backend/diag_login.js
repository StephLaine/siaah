require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
});

async function run() {
    try {
        const res = await pool.query(`
            SELECT id, email, password, role_id, office_id, first_name, last_name
            FROM users
            ORDER BY id
            LIMIT 10
        `);

        if (res.rows.length === 0) {
            console.log('❌ No users found in the database!');
            console.log('→ Run: node seed_admin.js');
        } else {
            console.log(`✅ Found ${res.rows.length} user(s):\n`);
            res.rows.forEach(u => {
                console.log(`  ID: ${u.id}`);
                console.log(`  Name: ${u.first_name} ${u.last_name}`);
                console.log(`  Email: ${u.email}`);
                console.log(`  Password: ${u.password}`);
                console.log(`  Role ID: ${u.role_id}`);
                console.log(`  Office ID: ${u.office_id}`);
                console.log('  ─────────────────────────');
            });
        }
    } catch (err) {
        console.error('❌ DB Error:', err.message);
    } finally {
        pool.end();
    }
}

run();
