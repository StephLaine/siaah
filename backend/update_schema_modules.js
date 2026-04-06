const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

async function updateSchema() {
    try {
        console.log("Starting schema update for Modules/Services access control...");

        // 1. Add assigned_services to users (JSONB array of service names or IDs)
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_services JSONB DEFAULT '[]';
        `);

        // 2. Ensure requested services exist in 'services' table
        const modules = [
            'Immatriculation',
            'Permis de Conduire',
            'Assurances',
            'Contraventions',
            'Code de la route',
            'Station de services',
            'Accidents de la route'
        ];

        for (const m of modules) {
            // Check if exists first to avoid duplicates if no UNIQUE constraint
            const check = await pool.query('SELECT id FROM services WHERE name = $1', [m]);
            if (check.rows.length === 0) {
                await pool.query(`
                    INSERT INTO services (name, description, categorie, actif)
                    VALUES ($1, $2, 'Gestion', true)
                `, [m, `Service de ${m}`]);
                console.log(`Created service: ${m}`);
            } else {
                console.log(`Service already exists: ${m}`);
            }
        }

        console.log("Schema update completed successfully.");
    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        await pool.end();
        process.exit();
    }
}

updateSchema();
