const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15000,
});

const SCHEMA = [
  // 1. Roles
  `CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
  )`,

  // 2. Entities
  `CREATE TABLE IF NOT EXISTS entities (
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
  )`,

  // 3. Offices
  `CREATE TABLE IF NOT EXISTS offices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    entity_id INT REFERENCES entities(id) ON DELETE SET NULL,
    type VARCHAR(20),
    code VARCHAR(30),
    address VARCHAR(255),
    departement VARCHAR(50),
    commune VARCHAR(100),
    quartier VARCHAR(200),
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
  )`,

  // 4. Users
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nif VARCHAR(60) UNIQUE,
    phone VARCHAR(30),
    phone2 VARCHAR(30),
    sexe VARCHAR(20),
    dob DATE,
    pob VARCHAR(100),
    nationality VARCHAR(50),
    cin VARCHAR(100) UNIQUE,
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
  )`,

  // 5. Services
  `CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    categorie VARCHAR(100),
    price DECIMAL(10,2) DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    actif BOOLEAN DEFAULT TRUE,
    required_documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  )`,

  // 6. Entity Services
  `CREATE TABLE IF NOT EXISTS entity_services (
    entity_id INT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (entity_id, service_id)
  )`,

  // 7. Service Operations
  `CREATE TABLE IF NOT EXISTS service_operations (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    required_documents JSONB DEFAULT '[]'::jsonb,
    price DECIMAL(10,2) DEFAULT 0,
    price_htg DECIMAL(10,2) DEFAULT 0,
    detailed_description TEXT,
    actif BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (service_id, name)
  )`,

  // 8. Service Requests
  `CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE SET NULL,
    office_id INT REFERENCES offices(id) ON DELETE SET NULL,
    dossier_id VARCHAR(50) UNIQUE,
    type VARCHAR(200),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    details JSONB,
    notes TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 9. Request Documents
  `CREATE TABLE IF NOT EXISTS request_documents (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    operation_id INT REFERENCES service_operations(id) ON DELETE SET NULL,
    document_name VARCHAR(255),
    file_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 10. Vehicle Makes
  `CREATE TABLE IF NOT EXISTS vehicle_makes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 11. Vehicle Models
  `CREATE TABLE IF NOT EXISTS vehicle_models (
    id SERIAL PRIMARY KEY,
    make_id INT NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(make_id, name)
  )`,

  // 12. Vehicle Colors
  `CREATE TABLE IF NOT EXISTS vehicle_colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    hex_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 13. Vehicles
  `CREATE TABLE IF NOT EXISTS vehicles (
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
  )`,

  // 14. License Categories
  `CREATE TABLE IF NOT EXISTS license_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255),
    description TEXT,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 15. Licenses (Original/General)
  `CREATE TABLE IF NOT EXISTS licenses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE,
    category VARCHAR(50),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'suspended', 'revoked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 16. Driver Licenses (Additional/Permits refs)
  `CREATE TABLE IF NOT EXISTS driver_licenses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE,
    category VARCHAR(10),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'valid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 17. Appointments
  `CREATE TABLE IF NOT EXISTS appointments (
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
  )`,

  // 18. Communications
  `CREATE TABLE IF NOT EXISTS communications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 19. Registrations
  `CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    office_id INT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 20. Insurances
  `CREATE TABLE IF NOT EXISTS insurances (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    office_id INT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
    policy_number VARCHAR(50) UNIQUE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 21. Violations
  `CREATE TABLE IF NOT EXISTS violations (
    id SERIAL PRIMARY KEY,
    license_id INT REFERENCES licenses(id) ON DELETE SET NULL,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE SET NULL,
    agent_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    violation_type VARCHAR(255) NOT NULL,
    fine_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
    violation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 22. Payments (CORRECT SCHEMA for payment.controller.js)
  `CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    request_id INT REFERENCES service_requests(id) ON DELETE SET NULL,
    violation_id INT REFERENCES violations(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'HTG',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT UNIQUE,
    payment_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 23. Notifications
  `CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 24. Driving Permits (From 003_create_driving_permits.sql)
  `CREATE TABLE IF NOT EXISTS driving_permits (
    id SERIAL PRIMARY KEY,
    permit_number VARCHAR(50) UNIQUE NOT NULL,
    issuance_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 25. User Permits (From 004_create_user_permits.sql)
  `CREATE TABLE IF NOT EXISTS user_permits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permit_id INTEGER REFERENCES driving_permits(id) ON DELETE CASCADE,
    request_id INTEGER REFERENCES service_requests(id),
    status VARCHAR(20) DEFAULT 'assigned',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, permit_id)
  )`
];

async function runSetup() {
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    await pool.connect();
    console.log('✅ Connected.');

    // ── SCHEMA CREATION ───────────────────────────────────────────────────────
    console.log('\n🛠️  Applying database schema...');
    for (const sql of SCHEMA) {
      const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
      const tableName = match ? match[1] : 'unknown';
      console.log(`   - Creating table: ${tableName}`);
      await pool.query(sql);
    }
    console.log('✅ Schema applied successfully.');

    // ── SEEDING ───────────────────────────────────────────────────────────────
    console.log('\n🌱 Seeding database...');

    // 1. Roles
    console.log('   - Seeding roles...');
    const roles = ['SuperAdmin', 'Admin', 'Employee', 'Agent Immatriculation', 'Agent Assurance', 'Agent Permis', 'Agent Routier', 'User'];
    for (const r of roles) {
      await pool.query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [r]);
    }

    // 2. Entities
    console.log('   - Seeding entities...');
    const entities = [
      { name: "Ministère de l'Économie et des Finances", sigle: 'MEF', type: 'Ministère' },
      { name: "Direction Générale des Impôts", sigle: 'DGI', type: 'Direction' },
      { name: "Office Assurance Véhicules Contre Tiers", sigle: 'OAVCT', type: 'Office' },
      { name: "Direction de la Circulation et de la Police Routière", sigle: 'DCPR', type: 'Direction' }
    ];
    for (const e of entities) {
      await pool.query(
        `INSERT INTO entities (name, sigle, type_entite, statut) 
         VALUES ($1, $2, $3, 'Actif') ON CONFLICT (name) DO NOTHING`,
        [e.name, e.sigle, e.type]
      );
    }

    // Get entity IDs map
    const entRes = await pool.query('SELECT id, sigle FROM entities');
    const entityMap = {};
    entRes.rows.forEach(r => entityMap[r.sigle] = r.id);

    // 3. Offices
    console.log('   - Seeding offices...');
    const offices = [
      { name: 'SIAAH Headquarters', type: 'GLOBAL', entity: 'MEF' },
      { name: 'OAVCT Port-au-Prince', type: 'OAVCT', entity: 'OAVCT' },
      { name: 'DGI Port-au-Prince', type: 'DGI', entity: 'DGI' },
      { name: 'DCPR Port-au-Prince', type: 'DCPR', entity: 'DCPR' },
      { name: 'Siège MEF', type: 'GLOBAL', entity: 'MEF' }
    ];
    for (const o of offices) {
      const entityId = entityMap[o.entity] || null;
      await pool.query(
        `INSERT INTO offices (name, type, entity_id, statut) 
         VALUES ($1, $2, $3, 'Actif') ON CONFLICT (name) DO NOTHING`,
        [o.name, o.type, entityId]
      );
    }

    // 4. License Categories
    console.log('   - Seeding license categories...');
    const categories = [
      { code: 'A', name: 'Catégorie A : Motocyclette', desc: 'Pour les conducteurs de motos et tricycles motorisés.' },
      { code: 'B', name: 'Catégorie B : Véhicule léger (voiture)', desc: 'Pour les conducteurs de voitures particulières, utilitaires légers.' },
      { code: 'C', name: 'Catégorie C : Camion', desc: 'Pour les conducteurs de véhicules lourds (camions de plus de 3.5 t).' },
      { code: 'D', name: 'Catégorie D : Transport en commun', desc: 'Pour les conducteurs de véhicules de transport de personnes (plus de 9 places).' },
      { code: 'E', name: 'Catégorie E : Véhicule avec remorque', desc: 'Pour les conducteurs de véhicules des catégories B, C ou D attelés d\'une remorque lourde.' }
    ];
    for (const c of categories) {
      await pool.query(
        `INSERT INTO license_categories (code, name, description) 
         VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING`,
        [c.code, c.name, c.desc]
      );
    }

    // 5. Services & Operations
    console.log('   - Seeding services and operations...');
    const services = [
      { name: 'Permis de conduire', desc: 'Demande ou renouvellement de permis de conduire.' },
      { name: 'Immatriculation', desc: 'Enregistrement de véhicule et obtention de plaques.' },
      { name: 'Assurance', desc: 'Souscription ou renouvellement d\'assurance véhicule.' },
      { name: 'Contravention', desc: 'Consultation et paiement d\'infractions routières.' }
    ];
    
    const operations = {
      'Permis de conduire': [
        { name: 'Nouveau permis' },
        { name: 'Renouveler un permis de conduire', desc: 'La procédure détaillée pour ce service sera bientôt disponible.' },
        { name: 'Corriger un permis' },
        { name: 'Remplacer un permis' }
      ],
      'Immatriculation': [
        { name: 'Immatriculer un véhicule' },
        { name: "Renouveler une plaque d'immatriculation" },
        { name: 'Transférer un Véhicule' },
        { name: 'Remplacer une Plaque' }
      ],
      'Assurance': [
        { name: "Faire une Demande d'Assurance" },
        { name: 'Renouveler une Assurance' }
      ],
      'Contravention': [
        { name: 'Nouvelle contravention' },
        { name: 'Payer contravention' }
      ]
    };

    const serviceIdMap = {};
    for (const s of services) {
      const res = await pool.query(
        `INSERT INTO services (name, description, categorie, is_public, actif) 
         VALUES ($1, $2, $1, TRUE, TRUE) 
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, categorie = EXCLUDED.categorie
         RETURNING id`,
        [s.name, s.desc]
      );
      serviceIdMap[s.name] = res.rows[0].id;
    }

    for (const [svcName, ops] of Object.entries(operations)) {
      const serviceId = serviceIdMap[svcName];
      for (const op of ops) {
        await pool.query(
          `INSERT INTO service_operations (service_id, name, description, required_documents, price, actif) 
           VALUES ($1, $2, $3, '[]'::jsonb, 0, TRUE) 
           ON CONFLICT (service_id, name) DO NOTHING`,
          [serviceId, op.name, op.desc || '']
        );
      }
    }

    // Link services to entities
    console.log('   - Seeding entity services relationships...');
    const entityServicesRel = [
      { entity: 'DGI', service: 'Immatriculation' },
      { entity: 'DGI', service: 'Permis de conduire' },
      { entity: 'OAVCT', service: 'Assurance' },
      { entity: 'DCPR', service: 'Contravention' }
    ];
    for (const rel of entityServicesRel) {
      const entityId = entityMap[rel.entity];
      const serviceId = serviceIdMap[rel.service];
      if (entityId && serviceId) {
        await pool.query(
          `INSERT INTO entity_services (entity_id, service_id) 
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [entityId, serviceId]
        );
      }
    }

    // 6. Vehicle References (Makes, Models, Colors)
    console.log('   - Seeding vehicle makes...');
    const makes = ['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Suzuki', 'Isuzu', 'Mitsubishi'];
    for (const make of makes) {
      await pool.query('INSERT INTO vehicle_makes (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [make]);
    }

    const makeRes = await pool.query('SELECT id, name FROM vehicle_makes');
    const makeMap = {};
    makeRes.rows.forEach(r => makeMap[r.name] = r.id);

    console.log('   - Seeding vehicle models...');
    const models = [
      { make: 'Toyota', name: 'Land Cruiser' },
      { make: 'Toyota', name: 'Hilux' },
      { make: 'Toyota', name: 'RAV4' },
      { make: 'Toyota', name: 'Corolla' },
      { make: 'Honda', name: 'CR-V' },
      { make: 'Honda', name: 'Civic' },
      { make: 'Nissan', name: 'Patrol' },
      { make: 'Nissan', name: 'Frontier' },
      { make: 'Suzuki', name: 'Grand Vitara' },
      { make: 'Suzuki', name: 'Jimny' },
      { make: 'Ford', name: 'Ranger' },
      { make: 'Ford', name: 'Everest' },
      { make: 'Hyundai', name: 'Tucson' },
      { make: 'Hyundai', name: 'Santa Fe' }
    ];
    for (const model of models) {
      const makeId = makeMap[model.make];
      if (makeId) {
        await pool.query(
          `INSERT INTO vehicle_models (make_id, name) 
           VALUES ($1, $2) ON CONFLICT (make_id, name) DO NOTHING`,
          [makeId, model.name]
        );
      }
    }

    console.log('   - Seeding vehicle colors...');
    const colors = [
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Noir', hex: '#000000' },
      { name: 'Gris Argent', hex: '#C0C0C0' },
      { name: 'Gris Anthracite', hex: '#464646' },
      { name: 'Bleu Marine', hex: '#000080' },
      { name: 'Rouge', hex: '#FF0000' },
      { name: 'Vert Olive', hex: '#808000' },
      { name: 'Beige', hex: '#F5F5DC' }
    ];
    for (const color of colors) {
      await pool.query(
        `INSERT INTO vehicle_colors (name, hex_code) 
         VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [color.name, color.hex]
      );
    }

    // 7. Users (SuperAdmin)
    console.log('   - Seeding default administrator users (SuperAdmin)...');
    
    // Hash passwords to be compatible with login bcrypt check
    const salt = await bcrypt.genSalt(10);
    const superAdminHashedPassword = await bcrypt.hash('Admin@2024!', salt);

    const superAdminRoleRes = await pool.query("SELECT id FROM roles WHERE name = 'SuperAdmin' LIMIT 1");
    const adminOfficeRes = await pool.query("SELECT id FROM offices WHERE name = 'SIAAH Headquarters' LIMIT 1");

    if (superAdminRoleRes.rowCount > 0 && adminOfficeRes.rowCount > 0) {
      const roleId = superAdminRoleRes.rows[0].id;
      const officeId = adminOfficeRes.rows[0].id;

      // Seed admin@siaah.ht
      await pool.query(
        `INSERT INTO users (first_name, last_name, email, password, role_id, office_id, is_active)
         VALUES ('Super', 'Admin', 'admin@siaah.ht', $1, $2, $3, TRUE)
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role_id = EXCLUDED.role_id, office_id = EXCLUDED.office_id`,
        [superAdminHashedPassword, roleId, officeId]
      );
      console.log('      * Seeded admin@siaah.ht');

      // Seed superadmin@siaah.ht
      await pool.query(
        `INSERT INTO users (first_name, last_name, email, password, role_id, office_id, is_active)
         VALUES ('Super', 'Admin', 'superadmin@siaah.ht', $1, $2, $3, TRUE)
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role_id = EXCLUDED.role_id, office_id = EXCLUDED.office_id`,
        [superAdminHashedPassword, roleId, officeId]
      );
      console.log('      * Seeded superadmin@siaah.ht');
    } else {
      console.warn('      ⚠️  Could not seed SuperAdmin: role or office not found in DB!');
    }

    console.log('\n🌱 Seeding successfully completed!');
    console.log('✅ Database is fully ready!');
  } catch (err) {
    console.error('\n❌ Setup/migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSetup();
