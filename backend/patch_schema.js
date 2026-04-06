/**
 * patch_schema.js — Ajoute les colonnes manquantes sans perdre les données
 * Usage : node patch_schema.js
 */
require('dotenv').config();
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL non défini dans .env');
    process.exit(1);
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Fonction utilitaire : ajoute une colonne si elle n'existe pas
async function addColumnIfMissing(table, column, definition) {
    const res = await client.query(`
        SELECT 1 FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2
    `, [table, column]);

    if (res.rowCount === 0) {
        await client.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`   ✓ ${table}.${column} ajoutée`);
    } else {
        console.log(`   · ${table}.${column} existe déjà`);
    }
}

async function run() {
    try {
        await client.connect();
        console.log('✅ Connecté à la base externe\n');

        // ── offices : ajouter entity_id (requis par le login) ─────────────
        console.log('🏢 Patch table "offices"...');
        await addColumnIfMissing('offices', 'entity_id',       'INT REFERENCES entities(id) ON DELETE SET NULL');
        await addColumnIfMissing('offices', 'code',            'VARCHAR(30)');
        await addColumnIfMissing('offices', 'departement',     'VARCHAR(50)');
        await addColumnIfMissing('offices', 'commune',         'VARCHAR(100)');
        await addColumnIfMissing('offices', 'quartier',        'VARCHAR(100)');
        await addColumnIfMissing('offices', 'adresse',         'VARCHAR(255)');
        await addColumnIfMissing('offices', 'latitude',        'VARCHAR(30)');
        await addColumnIfMissing('offices', 'longitude',       'VARCHAR(30)');
        await addColumnIfMissing('offices', 'email',           'VARCHAR(100)');
        await addColumnIfMissing('offices', 'telephone',       'VARCHAR(30)');
        await addColumnIfMissing('offices', 'responsable_nom', 'VARCHAR(255)');
        await addColumnIfMissing('offices', 'responsable_fonction',  'VARCHAR(255)');
        await addColumnIfMissing('offices', 'responsable_telephone', 'VARCHAR(30)');
        await addColumnIfMissing('offices', 'responsable_email',     'VARCHAR(100)');
        await addColumnIfMissing('offices', 'type_bureau',     'VARCHAR(50)');
        await addColumnIfMissing('offices', 'heures_ouverture','VARCHAR(255)');
        await addColumnIfMissing('offices', 'statut',          "VARCHAR(30) DEFAULT 'Actif'");
        await addColumnIfMissing('offices', 'date_ouverture',  'DATE');

        // ── entities : s'assurer que la table existe ───────────────────────
        console.log('\n🏛️  Vérification table "entities"...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS entities (
                id                SERIAL PRIMARY KEY,
                name              VARCHAR(255) NOT NULL UNIQUE,
                sigle             VARCHAR(30),
                type_entite       VARCHAR(50),
                description       TEXT,
                statut            VARCHAR(20)  DEFAULT 'Actif',
                ministere_tutelle VARCHAR(255),
                responsable       VARCHAR(255),
                telephone         VARCHAR(30),
                email             VARCHAR(100),
                site_web          VARCHAR(255),
                pays              VARCHAR(100) DEFAULT 'Haïti',
                departement       VARCHAR(50),
                ville             VARCHAR(100),
                adresse           VARCHAR(255),
                code_postal       VARCHAR(20),
                date_creation     DATE,
                created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('   ✓ Table entities OK');

        // ── users : colonnes supplémentaires utilisées dans le profil ──────
        console.log('\n👤 Patch table "users"...');
        await addColumnIfMissing('users', 'entity_id',      'INT REFERENCES entities(id) ON DELETE SET NULL');
        await addColumnIfMissing('users', 'sexe',           'VARCHAR(10)');
        await addColumnIfMissing('users', 'dob',            'DATE');
        await addColumnIfMissing('users', 'pob',            'VARCHAR(100)');
        await addColumnIfMissing('users', 'cin',            'VARCHAR(50)');
        await addColumnIfMissing('users', 'marital_status', 'VARCHAR(20)');
        await addColumnIfMissing('users', 'blood_group',    'VARCHAR(10)');
        await addColumnIfMissing('users', 'city',           'VARCHAR(100)');
        await addColumnIfMissing('users', 'department',     'VARCHAR(100)');
        await addColumnIfMissing('users', 'country',        "VARCHAR(100) DEFAULT 'Haïti'");
        await addColumnIfMissing('users', 'full_address',   'TEXT');
        await addColumnIfMissing('users', 'address',        'VARCHAR(255)');
        await addColumnIfMissing('users', 'phone2',         'VARCHAR(20)');
        await addColumnIfMissing('users', 'photo',          'TEXT');
        await addColumnIfMissing('users', 'profile_photo',  'TEXT');
        await addColumnIfMissing('users', 'is_active',      'BOOLEAN DEFAULT TRUE');
        await addColumnIfMissing('users', 'last_login',     'TIMESTAMP');
        await addColumnIfMissing('users', 'date_of_birth',  'DATE');
        await addColumnIfMissing('users', 'gender',         'VARCHAR(10)');
        await addColumnIfMissing('users', 'nationality',    'VARCHAR(50)');

        // ── service_requests : colonnes supplémentaires ────────────────────
        console.log('\n📋 Patch table "service_requests"...');
        const srExists = await client.query(`
            SELECT 1 FROM information_schema.tables WHERE table_name = 'service_requests'
        `);
        if (srExists.rowCount > 0) {
            await addColumnIfMissing('service_requests', 'service_id', 'INT REFERENCES services(id) ON DELETE SET NULL');
            await addColumnIfMissing('service_requests', 'office_id',  'INT REFERENCES offices(id) ON DELETE SET NULL');
            await addColumnIfMissing('service_requests', 'dossier_id', 'VARCHAR(50)');
            await addColumnIfMissing('service_requests', 'notes',      'TEXT');
            await addColumnIfMissing('service_requests', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        } else {
            console.log('   · service_requests sera créée au prochain migrate');
        }

        // ── Seed entités de base si vides ─────────────────────────────────
        console.log('\n🌱 Seed entités...');
        await client.query(`
            INSERT INTO entities (name, sigle, type_entite, statut) VALUES
                ('Ministère de l''Économie et des Finances', 'MEF', 'Ministère', 'Actif'),
                ('Direction Générale des Impôts', 'DGI', 'Direction', 'Actif'),
                ('Office Assurance Véhicules Contre Tiers', 'OAVCT', 'Office', 'Actif'),
                ('Direction de la Circulation et de la Police Routière', 'DCPR', 'Direction', 'Actif')
            ON CONFLICT (name) DO NOTHING
        `);
        console.log('   ✓ Entités OK');

        // ── Rôles ──────────────────────────────────────────────────────────
        console.log('\n🎭 Seed rôles...');
        await client.query(`
            INSERT INTO roles (name) VALUES
                ('SuperAdmin'), ('Admin'), ('Employee'),
                ('Agent Immatriculation'), ('Agent Assurance'),
                ('Agent Permis'), ('Agent Routier'), ('User')
            ON CONFLICT (name) DO NOTHING
        `);
        console.log('   ✓ Rôles OK');

        // ── SuperAdmin si absent ───────────────────────────────────────────
        console.log('\n👑 SuperAdmin...');
        const roleRes = await client.query(`SELECT id FROM roles WHERE name = 'SuperAdmin' LIMIT 1`);
        const superAdminRoleId = roleRes.rows[0]?.id;

        if (superAdminRoleId) {
            await client.query(`
                INSERT INTO users (first_name, last_name, email, password, role_id, is_active)
                VALUES ('Super', 'Admin', 'superadmin@siaah.ht', 'SuperAdmin@2024!', $1, TRUE)
                ON CONFLICT (email) DO UPDATE SET role_id = EXCLUDED.role_id, is_active = TRUE
            `, [superAdminRoleId]);
            console.log('   ✓ SuperAdmin OK');
        }

        console.log('\n══════════════════════════════════════════');
        console.log('  🎉  Patch terminé avec succès !');
        console.log('══════════════════════════════════════════');
        console.log('  📧 superadmin@siaah.ht');
        console.log('  🔑 SuperAdmin@2024!');
        console.log('══════════════════════════════════════════\n');

    } catch (err) {
        console.error('\n❌ Erreur :', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
