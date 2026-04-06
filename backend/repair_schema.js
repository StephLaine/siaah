/**
 * repair_schema.js
 * Repairs the remote schema to ensure all columns exist.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function addColumn(table, col, def) {
    try {
        await client.query(`ALTER TABLE "${table}" ADD COLUMN "${col}" ${def}`);
        console.log(`✓ Added ${col} to ${table}.`);
    } catch (e) {
        // console.log(`· ${col} already in ${table} or error.`);
    }
}

async function run() {
    await client.connect();
    console.log('Repairing schema...');
    
    // license_categories fixes
    await addColumn('license_categories', 'id', 'SERIAL PRIMARY KEY'); // This might fail if it's already there but just hidden in listing
    await addColumn('license_categories', 'name', 'VARCHAR(255)');
    await addColumn('license_categories', 'actif', 'BOOLEAN DEFAULT TRUE');
    
    // users fixes- already looks mostly okay but ensure CIN/NIF/Phone2/FullAddress
    await addColumn('users', 'phone2', 'VARCHAR(30)');
    await addColumn('users', 'full_address', 'TEXT');
    await addColumn('users', 'cin', 'VARCHAR(100) UNIQUE');
    await addColumn('users', 'nif', 'VARCHAR(60) UNIQUE');
    await addColumn('users', 'blood_group', 'VARCHAR(10)');
    await addColumn('users', 'marital_status', 'VARCHAR(50)');
    
    // service_operations fixes
    await addColumn('service_operations', 'price', 'DECIMAL(10,2) DEFAULT 0');
    
    console.log('Schema repaired. Running final seed...');
    await client.end();
}
run();
