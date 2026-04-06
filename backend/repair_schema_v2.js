/**
 * repair_schema_v2.js
 * Comprehensive repair for SIAAH external DB.
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
        console.log('--- DB REPAIR V2 ---');

        // 1. Services table repair
        console.log('Repairing services...');
        await client.query('ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "required_documents" JSONB DEFAULT \'[]\'');
        await client.query('ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "actif" BOOLEAN DEFAULT TRUE');
        await client.query('ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "categorie" VARCHAR(100)');

        // 2. Service Operations repair
        console.log('Repairing service_operations...');
        await client.query('ALTER TABLE "service_operations" ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) DEFAULT 0');
        await client.query('ALTER TABLE "service_operations" ADD COLUMN IF NOT EXISTS "required_documents" JSONB DEFAULT \'[]\'');

        // 3. User table repair
        console.log('Repairing users...');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nif" VARCHAR(60)');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cin" VARCHAR(60)');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dob" DATE');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pob" VARCHAR(100)');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sexe" VARCHAR(20)');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "blood_group" VARCHAR(10)');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nationality" VARCHAR(50)');
        
        // 4. Offices table repair
        console.log('Repairing offices...');
        await client.query('ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "location" VARCHAR(255)');
        await client.query('ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "type" VARCHAR(30)');
        
        // 5. License Categories (This one is problematic if broken)
        console.log('Resetting license_categories...');
        await client.query('DROP TABLE IF EXISTS "license_categories" CASCADE');
        await client.query('CREATE TABLE "license_categories" ("id" SERIAL PRIMARY KEY, "code" VARCHAR(10) UNIQUE NOT NULL, "name" VARCHAR(255), "description" TEXT, "actif" BOOLEAN DEFAULT TRUE, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');

        console.log('REPAIR COMPLETED.');
        
        // Final Seed Step
        console.log('Running final sync...');
        // I will run the sync script after this manually.

    } catch (e) {
        console.error('ERROR DURING REPAIR:', e.message);
    } finally {
        await client.end();
    }
}

run();
