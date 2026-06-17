require('dotenv').config();
const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        // Get raw password hash from DB
        const res = await db.query(
            "SELECT id, email, password FROM users WHERE email = 'admin@siaah.ht'"
        );
        const user = res.rows[0];
        console.log('User ID:', user.id);
        console.log('Password hash stored:', user.password);

        // Test comparison
        const testPass = 'Admin2024';
        const match = await bcrypt.compare(testPass, user.password);
        console.log(`bcrypt.compare("${testPass}", hash) =`, match);

        // Also test via the API logic - simulate what auth.controller does
        console.log('\nSimulating controller query...');
        const query = `
            SELECT u.*, o.name as office_name, e.name as entity_name, e.sigle as entity_sigle
            FROM users u
            LEFT JOIN offices o ON u.office_id = o.id
            LEFT JOIN entities e ON o.entity_id = e.id
            WHERE u.email = $1
        `;
        const result = await db.query(query, ['admin@siaah.ht']);
        const ctrl_user = result.rows[0];
        console.log('Controller query user password:', ctrl_user.password.substring(0, 20), '...');
        const ctrl_match = await bcrypt.compare(testPass, ctrl_user.password);
        console.log('Match from controller query:', ctrl_match);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        db.pool.end();
    }
}
run();
