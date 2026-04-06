const mysql = require('mysql2/promise');
require('dotenv').config();

const testConnection = async () => {
    try {
        console.log('Testing connection (No DB) with:');
        console.log('Host:', process.env.DB_HOST);
        console.log('User:', process.env.DB_USER);
        console.log('Port:', process.env.DB_PORT || 3306);

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT || 3306,
            connectTimeout: 5000,
        });
        console.log('Success! Connected to MySQL server.');

        const [rows] = await connection.query('SHOW DATABASES');
        console.log('Available databases:', rows.map(r => r.Database).join(', '));

        await connection.end();
    } catch (err) {
        console.error('Connection failed:');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
    }
};

testConnection();
