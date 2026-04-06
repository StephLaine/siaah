const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const seedDatabase = async () => {
    // Connect to 'postgres' database first to ensure target database exists
    const adminClient = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
        database: 'postgres'
    });

    try {
        await adminClient.connect();
        console.log('Connected to PostgreSQL admin server');

        // Check if database exists
        const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
        if (res.rowCount === 0) {
            await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Database ${process.env.DB_NAME} created`);
        } else {
            console.log(`Database ${process.env.DB_NAME} already exists`);
        }
        await adminClient.end();

        // Connect to target database
        const client = new Client({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME
        });

        await client.connect();
        console.log(`Connected to database ${process.env.DB_NAME}`);

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split schema into individual queries
        // Note: PostgreSQL can handle multiple queries in one call, but splitting is safer for debug
        await client.query(schema);
        console.log('Database schema and seed data applied successfully');

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
