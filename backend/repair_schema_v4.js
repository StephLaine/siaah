/**
 * repair_schema_v4.js
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('--- DB REPAIR V4 ---');

        console.log('Adding job_title to users table...');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "job_title" VARCHAR(100)');
        
        console.log('Final schema check passed.');
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await client.end();
    }
}
run();
