/**
 * master_migration_v2.js
 * Run migrations one by one to find the error.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const tables = [
    { name: 'roles', sql: 'CREATE TABLE IF NOT EXISTS roles (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE)' },
    { name: 'entities', sql: `CREATE TABLE IF NOT EXISTS entities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        sigle VARCHAR(30),
        type_entite VARCHAR(50),
        description TEXT,
        statut VARCHAR(20) DEFAULT 'Actif',
        ministere_tutelle VARCHAR(255),
        responsable VARCHAR(255),
        telephone VARCHAR(30),
        email VARCHAR(100),
        site_web VARCHAR(255),
        pays VARCHAR(100) DEFAULT 'Haïti',
        departement VARCHAR(50),
        ville VARCHAR(100),
        adresse VARCHAR(255),
        code_postal VARCHAR(20),
        date_creation DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'offices', sql: `CREATE TABLE IF NOT EXISTS offices (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        entity_id INT REFERENCES entities(id) ON DELETE SET NULL,
        type VARCHAR(20),
        code VARCHAR(30),
        address VARCHAR(255),
        departement VARCHAR(50),
        commune VARCHAR(100),
        quartier VARCHAR(100),
        adresse VARCHAR(255),
        location VARCHAR(255),
        latitude VARCHAR(30),
        longitude VARCHAR(30),
        email VARCHAR(100),
        telephone VARCHAR(30),
        contact_email VARCHAR(100),
        responsable_nom VARCHAR(255),
        responsable_fonction VARCHAR(255),
        responsable_telephone VARCHAR(30),
        responsable_email VARCHAR(100),
        type_bureau VARCHAR(50),
        heures_ouverture VARCHAR(255),
        statut VARCHAR(30) DEFAULT 'Actif',
        date_ouverture DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'users', sql: `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nif VARCHAR(20) UNIQUE,
        phone VARCHAR(20),
        phone2 VARCHAR(20),
        sexe VARCHAR(20),
        dob DATE,
        pob VARCHAR(100),
        nationality VARCHAR(50),
        cin VARCHAR(50) UNIQUE,
        marital_status VARCHAR(50),
        blood_group VARCHAR(10),
        city VARCHAR(100),
        department VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Haïti',
        full_address TEXT,
        address VARCHAR(255),
        photo TEXT,
        profile_photo TEXT,
        office_id INT REFERENCES offices(id) ON DELETE SET NULL,
        entity_id INT REFERENCES entities(id) ON DELETE SET NULL,
        role_id INT REFERENCES roles(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        assigned_services JSONB DEFAULT '[]',
        note_somaire TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'services', sql: `CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        categorie VARCHAR(100),
        price DECIMAL(10,2) DEFAULT 0,
        required_documents JSONB DEFAULT '[]',
        actif BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'entity_services', sql: `CREATE TABLE IF NOT EXISTS entity_services (
        entity_id INT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
        service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        PRIMARY KEY (entity_id, service_id)
    )` },
    { name: 'service_operations', sql: `CREATE TABLE IF NOT EXISTS service_operations (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        required_documents JSONB DEFAULT '[]',
        price DECIMAL(10,2) DEFAULT 0,
        actif BOOLEAN DEFAULT TRUE,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'service_requests', sql: `CREATE TABLE IF NOT EXISTS service_requests (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        service_id INT REFERENCES services(id) ON DELETE SET NULL,
        office_id INT REFERENCES offices(id) ON DELETE SET NULL,
        dossier_id VARCHAR(50) UNIQUE,
        type VARCHAR(200),
        status VARCHAR(50) DEFAULT 'pending',
        details JSONB,
        notes TEXT,
        price DECIMAL(10,2) DEFAULT 0,
        payment_status VARCHAR(20) DEFAULT 'unpaid',
        payment_method VARCHAR(50),
        payment_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'request_documents', sql: `CREATE TABLE IF NOT EXISTS request_documents (
        id SERIAL PRIMARY KEY,
        request_id INT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
        operation_id INT REFERENCES service_operations(id) ON DELETE SET NULL,
        document_name VARCHAR(255),
        file_url TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'payments', sql: `CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        request_id INT REFERENCES service_requests(id) ON DELETE SET NULL,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'HTG',
        method VARCHAR(30),
        status VARCHAR(20) DEFAULT 'pending',
        transaction_id VARCHAR(100),
        moncash_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'notifications', sql: `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        message TEXT,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'vehicle_makes', sql: `CREATE TABLE IF NOT EXISTS vehicle_makes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'vehicle_models', sql: `CREATE TABLE IF NOT EXISTS vehicle_models (
        id SERIAL PRIMARY KEY,
        make_id INT NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(make_id, name)
    )` },
    { name: 'vehicle_colors', sql: `CREATE TABLE IF NOT EXISTS vehicle_colors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        hex_code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'vehicles', sql: `CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vin VARCHAR(50) UNIQUE NOT NULL,
        license_plate VARCHAR(20) UNIQUE,
        make VARCHAR(50),
        model VARCHAR(50),
        year INT,
        color VARCHAR(30),
        fuel_type VARCHAR(30),
        vehicle_type VARCHAR(50),
        engine_number VARCHAR(50),
        seats_count INT DEFAULT 5,
        photo_url TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'license_categories', sql: `CREATE TABLE IF NOT EXISTS license_categories (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255),
        description TEXT,
        actif BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'licenses', sql: `CREATE TABLE IF NOT EXISTS licenses (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(50) UNIQUE,
        category VARCHAR(50),
        issue_date DATE,
        expiry_date DATE,
        status VARCHAR(20) DEFAULT 'valid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'driver_licenses', sql: `CREATE TABLE IF NOT EXISTS driver_licenses (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(50) UNIQUE,
        category VARCHAR(10),
        issue_date DATE,
        expiry_date DATE,
        status VARCHAR(20) DEFAULT 'valid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'appointments', sql: `CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service VARCHAR(100) NOT NULL,
        service_type VARCHAR(200),
        appointment_date DATE NOT NULL,
        appointment_time TIME,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(200),
        phone VARCHAR(30),
        nif VARCHAR(50),
        notes TEXT,
        status VARCHAR(30) DEFAULT 'pending',
        office_id INTEGER REFERENCES offices(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )` },
    { name: 'communications', sql: `CREATE TABLE IF NOT EXISTS communications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_id INT REFERENCES users(id) ON DELETE SET NULL,
        subject VARCHAR(255),
        message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'registrations', sql: `CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      office_id INT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'pending',
      expiry_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'insurances', sql: `CREATE TABLE IF NOT EXISTS insurances (
      id SERIAL PRIMARY KEY,
      vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      office_id INT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
      policy_number VARCHAR(50) UNIQUE,
      start_date DATE,
      end_date DATE,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` },
    { name: 'violations', sql: `CREATE TABLE IF NOT EXISTS violations (
      id SERIAL PRIMARY KEY,
      license_id INT REFERENCES licenses(id) ON DELETE SET NULL,
      vehicle_id INT REFERENCES vehicles(id) ON DELETE SET NULL,
      agent_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      violation_type VARCHAR(255) NOT NULL,
      fine_amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'unpaid',
      violation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )` }
];

const seeds = [
    { name: 'roles', sql: "INSERT INTO roles (name) VALUES ('SuperAdmin'), ('Admin'), ('Employee'), ('Agent Immatriculation'), ('Agent Assurance'), ('Agent Permis'), ('Agent Routier'), ('User') ON CONFLICT (name) DO NOTHING" },
    { name: 'entities', sql: `INSERT INTO entities (name, sigle, type_entite, statut) VALUES
        ('Ministère de l''Économie et des Finances', 'MEF', 'Ministère', 'Actif'),
        ('Direction Générale des Impôts', 'DGI', 'Direction', 'Actif'),
        ('Office Assurance Véhicules Contre Tiers', 'OAVCT', 'Office', 'Actif'),
        ('Direction de la Circulation et de la Police Routière', 'DCPR', 'Direction', 'Actif')
        ON CONFLICT (name) DO NOTHING` },
    { name: 'offices', sql: "INSERT INTO offices (name, type, statut) SELECT 'Siège MEF', 'GLOBAL', 'Actif' WHERE NOT EXISTS (SELECT 1 FROM offices WHERE name = 'Siège MEF')" },
    { name: 'license_categories', sql: `INSERT INTO license_categories (code, name, description) VALUES
        ('A', 'Catégorie A : Motocyclette', 'Pour les conducteurs de motos et tricycles motorisés.'),
        ('B', 'Catégorie B : Véhicule léger (voiture)', 'Pour les conducteurs de voitures particulières, utilitaires légers.'),
        ('C', 'Catégorie C : Camion', 'Pour les conducteurs de véhicules lourds (camions de plus de 3.5 t).'),
        ('D', 'Catégorie D : Transport en commun', 'Pour les conducteurs de véhicules de transport de personnes (plus de 9 places).'),
        ('E', 'Catégorie E : Véhicule avec remorque', 'Pour les conducteurs de véhicules des catégories B, C ou D attelés d''une remorque lourde.')
        ON CONFLICT (code) DO NOTHING` }
];

async function run() {
    try {
        await client.connect();
        console.log('✅ Connected to external database');

        for (const table of tables) {
            console.log(`- Creating table ${table.name}...`);
            await client.query(table.sql);
        }

        for (const seed of seeds) {
            console.log(`- Seeding ${seed.name}...`);
            await client.query(seed.sql);
        }

        // SuperAdmin
        console.log('- Preparing SuperAdmin...');
        const email = 'superadmin@siaah.ht';
        const pass = 'SuperAdmin@2024!';
        const roleRes = await client.query("SELECT id FROM roles WHERE name = 'SuperAdmin'");
        if (roleRes.rows.length > 0) {
            await client.query(`
                INSERT INTO users (first_name, last_name, email, password, role_id, is_active)
                VALUES ('Super', 'Admin', $1, $2, $3, TRUE)
                ON CONFLICT (email) DO UPDATE SET role_id = EXCLUDED.role_id, is_active = TRUE
            `, [email, pass, roleRes.rows[0].id]);
            console.log('✓ SuperAdmin user ready.');
        }

        console.log('\nMigration complete.');
    } catch (err) {
        console.error('\n❌ Migration failed at step:', err.message);
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
