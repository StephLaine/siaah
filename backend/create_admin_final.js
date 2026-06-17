require('dotenv').config();
const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        // Check roles table
        console.log('Checking roles table...');
        const rolesRes = await db.query('SELECT id, name FROM roles ORDER BY id');
        console.log('Roles:', rolesRes.rows);

        // Find SUPER_ADMIN role
        let superAdminRole = rolesRes.rows.find(r => 
            r.name === 'SUPER_ADMIN' || r.name === 'Super Admin' || r.name === 'SuperAdmin' || r.name === 'super_admin'
        );

        if (!superAdminRole) {
            console.log('SUPER_ADMIN role not found, creating it...');
            const newRole = await db.query(
                "INSERT INTO roles (name) VALUES ('SUPER_ADMIN') ON CONFLICT DO NOTHING RETURNING id, name"
            );
            if (newRole.rows.length > 0) {
                superAdminRole = newRole.rows[0];
            } else {
                const refetch = await db.query("SELECT id, name FROM roles WHERE name = 'SUPER_ADMIN'");
                superAdminRole = refetch.rows[0];
            }
        }
        console.log('Using role:', superAdminRole);

        // Get SIAAH HQ office
        const officeRes = await db.query("SELECT id, name FROM offices WHERE type = 'GLOBAL' LIMIT 1");
        const hqOffice = officeRes.rows[0];
        console.log('Using office:', hqOffice);

        const password = 'Admin@SIAAH2024!';
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if admin exists
        const existingAdmin = await db.query("SELECT id FROM users WHERE email = 'admin@siaah.ht'");

        if (existingAdmin.rows.length > 0) {
            console.log('Admin already exists, updating...');
            await db.query(
                "UPDATE users SET password = $1, role_id = $2, is_active = true WHERE email = 'admin@siaah.ht'",
                [hashedPassword, superAdminRole.id]
            );
            console.log('✅ Admin updated!');
        } else {
            const result = await db.query(`
                INSERT INTO users (first_name, last_name, email, password, role_id, office_id, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, email, role_id
            `, [
                'Admin',
                'SIAAH',
                'admin@siaah.ht',
                hashedPassword,
                superAdminRole.id,
                hqOffice ? hqOffice.id : null,
                true
            ]);
            console.log('\n✅ Admin user created!');
            console.log('   User:', result.rows[0]);
        }

        console.log('\n📋 Login credentials:');
        console.log('   Email:    admin@siaah.ht');
        console.log('   Password: Admin@SIAAH2024!');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
    } finally {
        db.pool.end();
    }
}

run();
