/**
 * safe_migration.js
 * Quoting all identifiers to avoid Postgres reserved word issues.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SCHEMA = [
    'CREATE TABLE IF NOT EXISTS "roles" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(50) NOT NULL UNIQUE)',
    
    'CREATE TABLE IF NOT EXISTS "entities" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(255) NOT NULL UNIQUE, "sigle" VARCHAR(30), "type_entite" VARCHAR(50), "description" TEXT, "statut" VARCHAR(20) DEFAULT \'Actif\', "ministere_tutelle" VARCHAR(255), "responsable" VARCHAR(255), "telephone" VARCHAR(30), "email" VARCHAR(100), "site_web" VARCHAR(255), "pays" VARCHAR(100) DEFAULT \'Haïti\', "departement" VARCHAR(50), "ville" VARCHAR(100), "adresse" VARCHAR(255), "code_postal" VARCHAR(20), "date_creation" DATE, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "offices" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(100) NOT NULL, "entity_id" INT REFERENCES "entities"("id") ON DELETE SET NULL, "type" VARCHAR(20), "code" VARCHAR(30), "address" VARCHAR(255), "departement" VARCHAR(50), "commune" VARCHAR(100), "quartier" VARCHAR(200), "adresse" VARCHAR(255), "location" VARCHAR(255), "latitude" VARCHAR(30), "longitude" VARCHAR(30), "email" VARCHAR(100), "telephone" VARCHAR(30), "contact_email" VARCHAR(100), "responsable_nom" VARCHAR(255), "responsable_fonction" VARCHAR(255), "responsable_telephone" VARCHAR(30), "responsable_email" VARCHAR(100), "type_bureau" VARCHAR(50), "heures_ouverture" VARCHAR(255), "statut" VARCHAR(30) DEFAULT \'Actif\', "date_ouverture" DATE, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "users" ("id" SERIAL PRIMARY KEY, "first_name" VARCHAR(100) NOT NULL, "last_name" VARCHAR(100) NOT NULL, "email" VARCHAR(100) NOT NULL UNIQUE, "password" VARCHAR(255) NOT NULL, "nif" VARCHAR(60) UNIQUE, "phone" VARCHAR(30), "phone2" VARCHAR(30), "sexe" VARCHAR(20), "dob" DATE, "pob" VARCHAR(100), "nationality" VARCHAR(50), "cin" VARCHAR(100) UNIQUE, "marital_status" VARCHAR(50), "blood_group" VARCHAR(10), "city" VARCHAR(100), "department" VARCHAR(100), "country" VARCHAR(100) DEFAULT \'Haïti\', "full_address" TEXT, "address" VARCHAR(255), "photo" TEXT, "profile_photo" TEXT, "office_id" INT REFERENCES "offices"("id") ON DELETE SET NULL, "entity_id" INT REFERENCES "entities"("id") ON DELETE SET NULL, "role_id" INT REFERENCES "roles"("id") ON DELETE SET NULL, "is_active" BOOLEAN DEFAULT TRUE, "last_login" TIMESTAMP, "assigned_services" JSONB DEFAULT \'[]\', "note_somaire" TEXT, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "services" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(255) NOT NULL, "description" TEXT, "categorie" VARCHAR(100), "price" DECIMAL(10,2) DEFAULT 0, "required_documents" JSONB DEFAULT \'[]\', "actif" BOOLEAN DEFAULT TRUE, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "entity_services" ("entity_id" INT NOT NULL REFERENCES "entities"("id") ON DELETE CASCADE, "service_id" INT NOT NULL REFERENCES "services"("id") ON DELETE CASCADE, PRIMARY KEY ("entity_id", "service_id"))',
    
    'CREATE TABLE IF NOT EXISTS "service_operations" ("id" SERIAL PRIMARY KEY, "service_id" INTEGER REFERENCES "services"("id") ON DELETE CASCADE, "name" VARCHAR(255) NOT NULL, "description" TEXT, "required_documents" JSONB DEFAULT \'[]\', "price" DECIMAL(10,2) DEFAULT 0, "actif" BOOLEAN DEFAULT TRUE, "order_index" INT DEFAULT 0, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "service_requests" ("id" SERIAL PRIMARY KEY, "user_id" INT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "service_id" INT REFERENCES "services"("id") ON DELETE SET NULL, "office_id" INT REFERENCES "offices"("id") ON DELETE SET NULL, "dossier_id" VARCHAR(50) UNIQUE, "type" VARCHAR(200), "status" VARCHAR(50) DEFAULT \'pending\', "details" JSONB, "notes" TEXT, "price" DECIMAL(10,2) DEFAULT 0, "payment_status" VARCHAR(20) DEFAULT \'unpaid\', "payment_method" VARCHAR(50), "payment_date" TIMESTAMP, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "request_documents" ("id" SERIAL PRIMARY KEY, "request_id" INT NOT NULL REFERENCES "service_requests"("id") ON DELETE CASCADE, "operation_id" INT REFERENCES "service_operations"("id") ON DELETE SET NULL, "document_name" VARCHAR(255), "file_url" TEXT, "status" VARCHAR(20) DEFAULT \'pending\', "uploaded_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "payments" ("id" SERIAL PRIMARY KEY, "request_id" INT REFERENCES "service_requests"("id") ON DELETE SET NULL, "user_id" INT REFERENCES "users"("id") ON DELETE SET NULL, "amount" DECIMAL(10,2) NOT NULL, "currency" VARCHAR(10) DEFAULT \'HTG\', "method" VARCHAR(30), "status" VARCHAR(20) DEFAULT \'pending\', "transaction_id" VARCHAR(100), "moncash_token" TEXT, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "notifications" ("id" SERIAL PRIMARY KEY, "user_id" INT REFERENCES "users"("id") ON DELETE CASCADE, "title" VARCHAR(255), "message" TEXT, "type" VARCHAR(50) DEFAULT \'info\', "is_read" BOOLEAN DEFAULT FALSE, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "vehicle_makes" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(100) NOT NULL UNIQUE, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "vehicle_models" ("id" SERIAL PRIMARY KEY, "make_id" INT NOT NULL REFERENCES "vehicle_makes"("id") ON DELETE CASCADE, "name" VARCHAR(100) NOT NULL, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE("make_id", "name"))',
    
    'CREATE TABLE IF NOT EXISTS "vehicle_colors" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(50) NOT NULL UNIQUE, "hex_code" VARCHAR(10), "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "vehicles" ("id" SERIAL PRIMARY KEY, "owner_id" INT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "vin" VARCHAR(50) UNIQUE NOT NULL, "license_plate" VARCHAR(20) UNIQUE, "make" VARCHAR(50), "model" VARCHAR(50), "year" INT, "color" VARCHAR(30), "fuel_type" VARCHAR(30), "vehicle_type" VARCHAR(50), "engine_number" VARCHAR(50), "seats_count" INT DEFAULT 5, "photo_url" TEXT, "status" VARCHAR(20) DEFAULT \'active\', "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "license_categories" ("id" SERIAL PRIMARY KEY, "code" VARCHAR(10) NOT NULL UNIQUE, "name" VARCHAR(255), "description" TEXT, "actif" BOOLEAN DEFAULT TRUE, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "licenses" ("id" SERIAL PRIMARY KEY, "user_id" INT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "license_number" VARCHAR(50) UNIQUE, "category" VARCHAR(50), "issue_date" DATE, "expiry_date" DATE, "status" VARCHAR(20) DEFAULT \'valid\', "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'CREATE TABLE IF NOT EXISTS "appointments" ("id" SERIAL PRIMARY KEY, "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE, "service" VARCHAR(100) NOT NULL, "service_type" VARCHAR(200), "appointment_date" DATE NOT NULL, "appointment_time" TIME, "first_name" VARCHAR(100), "last_name" VARCHAR(100), "email" VARCHAR(200), "phone" VARCHAR(30), "nif" VARCHAR(50), "notes" TEXT, "status" VARCHAR(30) DEFAULT \'pending\', "office_id" INTEGER REFERENCES "offices"("id") ON DELETE SET NULL, "created_at" TIMESTAMPTZ DEFAULT NOW(), "updated_at" TIMESTAMPTZ DEFAULT NOW())',
    
    'CREATE TABLE IF NOT EXISTS "communications" ("id" SERIAL PRIMARY KEY, "user_id" INT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "sender_id" INT REFERENCES "users"("id") ON DELETE SET NULL, "subject" VARCHAR(255), "message" TEXT, "sent_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
];

async function run() {
    try {
        await client.connect();
        for (const sql of SCHEMA) {
            const tableMatched = sql.match(/CREATE TABLE IF NOT EXISTS "([^"]+)"/);
            const tableName = tableMatched ? tableMatched[1] : 'unknown';
            console.log(`Creating table ${tableName}...`);
            await client.query(sql);
        }
        console.log('Seeding roles...');
        await client.query('INSERT INTO "roles" ("name") VALUES (\'SuperAdmin\'), (\'Admin\'), (\'Employee\'), (\'Agent Immatriculation\'), (\'Agent Assurance\'), (\'Agent Permis\'), (\'Agent Routier\'), (\'User\') ON CONFLICT ("name") DO NOTHING');
        
        console.log('Finished.');
    } catch (e) {
        console.error('ERROR:', e.message);
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
