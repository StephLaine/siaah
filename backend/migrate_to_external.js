/**
 * ═══════════════════════════════════════════════════════════════════════
 *  SIAAH — Script de migration vers la base EXTERNE
 *  Usage : node migrate_to_external.js
 * ═══════════════════════════════════════════════════════════════════════
 * 
 *  Ce script :
 *    1. Crée toutes les tables (idempotent — sûr à relancer)
 *    2. Insère les rôles et offices de base
 *    3. Crée le compte SuperAdmin UNIQUEMENT
 */

require('dotenv').config();
const { Client } = require('pg');
// Pas de bcrypt — le projet stocke les mots de passe en clair (voir auth.controller.js)

// ─── Connexion ───────────────────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL non défini dans .env');
    process.exit(1);
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ─── Schema complet ──────────────────────────────────────────────────────────
const SCHEMA = `
-- ── Roles ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- ── Entities (ex : DGI, OAVCT, DCPR, MEF…) ──────────────────────────────────
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
);

-- ── Offices (sous-bureaux des entities) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS offices (
    id                    SERIAL PRIMARY KEY,
    name                  VARCHAR(100) NOT NULL,
    entity_id             INT REFERENCES entities(id) ON DELETE SET NULL,
    type                  VARCHAR(20),
    code                  VARCHAR(30),
    address               VARCHAR(255),
    departement           VARCHAR(50),
    commune               VARCHAR(100),
    quartier              VARCHAR(100),
    adresse               VARCHAR(255),
    latitude              VARCHAR(30),
    longitude             VARCHAR(30),
    email                 VARCHAR(100),
    telephone             VARCHAR(30),
    contact_email         VARCHAR(100),
    responsable_nom       VARCHAR(255),
    responsable_fonction  VARCHAR(255),
    responsable_telephone VARCHAR(30),
    responsable_email     VARCHAR(100),
    type_bureau           VARCHAR(50),
    heures_ouverture      VARCHAR(255),
    statut                VARCHAR(30) DEFAULT 'Actif',
    date_ouverture        DATE,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                SERIAL PRIMARY KEY,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    email             VARCHAR(100) NOT NULL UNIQUE,
    password          VARCHAR(255) NOT NULL,
    nif               VARCHAR(20) UNIQUE,
    phone             VARCHAR(20),
    date_of_birth     DATE,
    gender            VARCHAR(10),
    nationality       VARCHAR(50),
    address           VARCHAR(255),
    city              VARCHAR(100),
    department        VARCHAR(100),
    profile_photo     TEXT,
    office_id         INT REFERENCES offices(id) ON DELETE SET NULL,
    entity_id         INT REFERENCES entities(id) ON DELETE SET NULL,
    role_id           INT REFERENCES roles(id) ON DELETE SET NULL,
    is_active         BOOLEAN DEFAULT TRUE,
    last_login        TIMESTAMP,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Services ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    categorie   VARCHAR(100),
    price       DECIMAL(10,2) DEFAULT 0,
    actif       BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Entity <-> Services ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entity_services (
    entity_id  INT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (entity_id, service_id)
);

-- ── Service Requests ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_requests (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id   INT REFERENCES services(id) ON DELETE SET NULL,
    office_id    INT REFERENCES offices(id) ON DELETE SET NULL,
    dossier_id   VARCHAR(50) UNIQUE,
    type         VARCHAR(50),
    status       VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','completed','rejected')),
    details      JSONB,
    notes        TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Operations ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS operations (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    service_id  INT REFERENCES services(id) ON DELETE CASCADE,
    order_index INT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Documents requis par opération ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS operation_documents (
    id           SERIAL PRIMARY KEY,
    operation_id INT NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    required     BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Uploads de documents ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS request_documents (
    id              SERIAL PRIMARY KEY,
    request_id      INT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    operation_id    INT REFERENCES operations(id) ON DELETE SET NULL,
    document_name   VARCHAR(255),
    file_url        TEXT,
    status          VARCHAR(20) DEFAULT 'pending',
    uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Paiements ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id             SERIAL PRIMARY KEY,
    request_id     INT REFERENCES service_requests(id) ON DELETE SET NULL,
    user_id        INT REFERENCES users(id) ON DELETE SET NULL,
    amount         DECIMAL(10,2) NOT NULL,
    currency       VARCHAR(10) DEFAULT 'HTG',
    method         VARCHAR(30),
    status         VARCHAR(20) DEFAULT 'pending'
                      CHECK (status IN ('pending','completed','failed','refunded')),
    transaction_id VARCHAR(100),
    moncash_token  TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INT REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(255),
    message    TEXT,
    type       VARCHAR(50) DEFAULT 'info',
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Véhicules ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
    id            SERIAL PRIMARY KEY,
    owner_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vin           VARCHAR(50) UNIQUE NOT NULL,
    license_plate VARCHAR(20) UNIQUE,
    make          VARCHAR(50),
    model         VARCHAR(50),
    year          INT,
    color         VARCHAR(30),
    fuel_type     VARCHAR(30),
    vehicle_type  VARCHAR(50),
    engine_number VARCHAR(50),
    seats_count   INT DEFAULT 5,
    photo_url     TEXT,
    status        VARCHAR(20) DEFAULT 'active',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Permis de conduire ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS licenses (
    id             SERIAL PRIMARY KEY,
    user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE,
    category       VARCHAR(50),
    issue_date     DATE,
    expiry_date    DATE,
    status         VARCHAR(20) DEFAULT 'valid'
                      CHECK (status IN ('valid','expired','suspended','revoked')),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── License Categories (SuperAdmin) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS license_categories (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    actif       BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// ─── Seeds de base ─────────────────────────────────────────────────────────────
const ROLES_SEED = `
INSERT INTO roles (name) VALUES
    ('SuperAdmin'), ('Admin'), ('Employee'),
    ('Agent Immatriculation'), ('Agent Assurance'),
    ('Agent Permis'), ('Agent Routier'), ('User')
ON CONFLICT (name) DO NOTHING;
`;

const ENTITIES_SEED = `
INSERT INTO entities (name, sigle, type_entite, statut) VALUES
    ('Ministère de l''Économie et des Finances', 'MEF', 'Ministère', 'Actif'),
    ('Direction Générale des Impôts', 'DGI', 'Direction', 'Actif'),
    ('Office Assurance Véhicules Contre Tiers', 'OAVCT', 'Office', 'Actif'),
    ('Direction de la Circulation et de la Police Routière', 'DCPR', 'Direction', 'Actif')
ON CONFLICT (name) DO NOTHING;
`;

const OFFICES_SEED = `
INSERT INTO offices (name, type, statut)
SELECT 'Siège MEF', 'GLOBAL', 'Actif' WHERE NOT EXISTS (
    SELECT 1 FROM offices WHERE name = 'Siège MEF'
);
`;

async function run() {
    try {
        await client.connect();
        console.log('✅ Connecté à la base externe\n');

        // 1. Schema
        console.log('📐 Création des tables...');
        await client.query(SCHEMA);
        console.log('   ✓ Tables créées\n');

        // 2. Rôles
        console.log('🎭 Insertion des rôles...');
        await client.query(ROLES_SEED);
        console.log('   ✓ Rôles insérés\n');

        // 3. Entities
        console.log('🏛️  Insertion des entités...');
        await client.query(ENTITIES_SEED);
        console.log('   ✓ Entités insérées\n');

        // 4. Offices
        console.log('🏢 Insertion des offices...');
        await client.query(OFFICES_SEED);
        console.log('   ✓ Offices insérés\n');

        // 5. SuperAdmin
        console.log('👤 Création du compte SuperAdmin...');
        const SUPERADMIN_EMAIL    = 'superadmin@siaah.ht';
        const SUPERADMIN_PASSWORD = 'SuperAdmin@2024!';

        const hash = SUPERADMIN_PASSWORD; // mot de passe en clair (pattern du projet)

        const roleRes = await client.query(`SELECT id FROM roles WHERE name = 'SuperAdmin' LIMIT 1`);
        if (roleRes.rowCount === 0) throw new Error('Rôle SuperAdmin introuvable');
        const superAdminRoleId = roleRes.rows[0].id;

        await client.query(`
            INSERT INTO users (first_name, last_name, email, password, role_id, is_active)
            VALUES ($1, $2, $3, $4, $5, TRUE)
            ON CONFLICT (email) DO UPDATE SET
                password  = EXCLUDED.password,
                role_id   = EXCLUDED.role_id,
                is_active = TRUE
        `, ['Super', 'Admin', SUPERADMIN_EMAIL, hash, superAdminRoleId]);

        console.log('\n══════════════════════════════════════════');
        console.log('  🎉  Migration terminée avec succès !');
        console.log('══════════════════════════════════════════');
        console.log('  📧 Email    :', SUPERADMIN_EMAIL);
        console.log('  🔑 Password :', SUPERADMIN_PASSWORD);
        console.log('  🎭 Rôle     : SuperAdmin');
        console.log('══════════════════════════════════════════\n');
        console.log('⚠️  Changez le mot de passe après la première connexion !');

    } catch (err) {
        console.error('\n❌ Erreur de migration :', err.message);
        console.error(err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
