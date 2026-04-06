const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

const migration = `
-- Create service_operations table
CREATE TABLE IF NOT EXISTS service_operations (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    required_documents JSONB DEFAULT '[]',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_service_operations_service_id ON service_operations(service_id);
`;

async function run() {
    try {
        await pool.query(migration);
        console.log("Table service_operations created successfully.");

        // Migration logic: Seed from hardcoded data if services exist
        // Immatriculation (46), Permis (47), Assurances (48), Contraventions (49)
        // Note: IDs might differ, let's fetch them first
        const services = await pool.query("SELECT id, name FROM services");
        const getSid = (name) => {
            const s = services.rows.find(r => r.name.includes(name));
            return s ? s.id : null;
        };

        const immSid = getSid('Immatriculation');
        const perSid = getSid('Permis');
        const assSid = getSid('Assurance');
        const conSid = getSid('Contravention');

        if (immSid) {
            await pool.query(`INSERT INTO service_operations (service_id, name) VALUES 
                ($1, 'Immatriculer un véhicule'),
                ($1, 'Renouveler une plaque d’immatriculation'),
                ($1, 'Transférer un véhicule'),
                ($1, 'Remplacer une plaque d’immatriculation'),
                ($1, 'Corriger')`, [immSid]);
        }
        if (perSid) {
            await pool.query(`INSERT INTO service_operations (service_id, name) VALUES 
                ($1, 'Nouveau permis de conduire'),
                ($1, 'Renouveler un permis'),
                ($1, 'Remplacer un permis'),
                ($1, 'Corriger un permis')`, [perSid]);
        }
        if (assSid) {
             await pool.query(`INSERT INTO service_operations (service_id, name) VALUES 
                ($1, 'Demande d’assurance'),
                ($1, 'Renouveler un contrat d’assurance'),
                ($1, 'Déclaration sinistre')`, [assSid]);
        }
        if (conSid) {
            await pool.query(`INSERT INTO service_operations (service_id, name) VALUES 
                ($1, 'Consulter mes contraventions'),
                ($1, 'Payer une contravention'),
                ($1, 'Consulter les infractions et amendes')`, [conSid]);
        }

        console.log("Hardcoded operations seeded.");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await pool.end();
    }
}

run();
