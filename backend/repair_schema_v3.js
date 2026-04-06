/**
 * repair_schema_v3.js
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
        console.log('--- DB REPAIR V3 ---');

        // Fix users
        console.log('Finalizing users table...');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "assigned_services" JSONB DEFAULT \'[]\'');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT TRUE');
        
        // Fix services if needed
        console.log('Ensuring required_documents in services...');
        await client.query('ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "required_documents" JSONB DEFAULT \'[]\'');

        console.log('Final schema check passed.');
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await client.end();
    }
}
run();
