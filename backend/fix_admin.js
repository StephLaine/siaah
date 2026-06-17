require('dotenv').config();
const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        // Check admin user
        const res = await db.query(
            "SELECT id, email, role_id, is_active FROM users WHERE email = 'admin@siaah.ht'"
        );
        console.log('Admin found:', res.rows);

        if (res.rows.length === 0) {
            console.log('No admin found! Creating one...');
        }

        // Reset password
        const newPassword = 'Admin2024';
        const hash = await bcrypt.hash(newPassword, 10);

        if (res.rows.length > 0) {
            await db.query(
                "UPDATE users SET password = $1, is_active = true WHERE email = 'admin@siaah.ht'",
                [hash]
            );
            console.log('Password updated to: Admin2024');
        } else {
            // Get role 1
            const rolesRes = await db.query("SELECT id FROM roles WHERE name = 'SuperAdmin' LIMIT 1");
            const officesRes = await db.query("SELECT id FROM offices LIMIT 1");
            await db.query(
                "INSERT INTO users (first_name, last_name, email, password, role_id, office_id, is_active) VALUES ('Admin', 'SIAAH', 'admin@siaah.ht', $1, $2, $3, true)",
                [hash, rolesRes.rows[0]?.id || 1, officesRes.rows[0]?.id || 1]
            );
            console.log('Admin created with password: Admin2024');
        }

        // Verify the new hash
        const checkRes = await db.query("SELECT password FROM users WHERE email = 'admin@siaah.ht'");
        const isValid = await bcrypt.compare(newPassword, checkRes.rows[0].password);
        console.log('Password verification:', isValid ? 'OK' : 'FAILED');

        console.log('\n=== CREDENTIALS ===');
        console.log('Email:    admin@siaah.ht');
        console.log('Password: Admin2024');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        db.pool.end();
    }
}

run();
