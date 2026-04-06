const { Client } = require('pg');
require('dotenv').config();

const checkUsers = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME
    });

    try {
        await client.connect();
        const result = await client.query('SELECT id, first_name, email, password, role_id FROM users LIMIT 10');
        console.log('Existing Users (first 10):');
        console.table(result.rows);
        
        const requests = await client.query("SELECT id, user_id, status FROM service_requests WHERE status = 'validated' LIMIT 5");
        console.log('Validated Requests:');
        console.table(requests.rows);

        await client.end();
    } catch (err) {
        console.error('Error fetching users:', err);
    }
};

checkUsers();
