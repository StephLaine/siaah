const { Client } = require('pg');
require('dotenv').config();

const migrate = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME
    });

    try {
        await client.connect();
        console.log('Connected. Running migrations...');

        const migrations = [
            // Add missing columns to offices table
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS code VARCHAR(50)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS departement VARCHAR(100)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS commune VARCHAR(100)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS quartier VARCHAR(100)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS adresse TEXT`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS latitude VARCHAR(50)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS longitude VARCHAR(50)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS telephone VARCHAR(50)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS email VARCHAR(100)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS responsable_nom VARCHAR(100)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS responsable_fonction VARCHAR(100)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS responsable_telephone VARCHAR(50)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS responsable_email VARCHAR(100)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS type_bureau VARCHAR(100)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS heures_ouverture VARCHAR(200)`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS statut VARCHAR(50) DEFAULT 'Actif'`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS date_ouverture DATE`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS entity_id INT REFERENCES entities(id) ON DELETE SET NULL`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
            // Add office_id to users
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS office_id INT REFERENCES offices(id) ON DELETE SET NULL`,
            // Add office_id to service_requests
            `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS office_id INT REFERENCES offices(id) ON DELETE SET NULL`,
            `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2)`,
            `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid'`,
            `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`,
            `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP`,
            `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
        ];

        for (const sql of migrations) {
            try {
                await client.query(sql);
                console.log('OK:', sql.substring(0, 60));
            } catch (e) {
                console.warn('SKIP:', e.message.substring(0, 80));
            }
        }

        console.log('\n✅ Migrations completed successfully!');
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err.message);
        process.exit(1);
    }
};

migrate();
