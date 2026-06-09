-- Database Schema for SIAAH (PostgreSQL)

-- Types (optional, using VARCHAR + CHECK for simplicity or just VARCHAR)

-- Offices (Tenants)
CREATE TABLE IF NOT EXISTS offices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) CHECK (type IN ('OAVCT', 'DGI', 'DCPR', 'MEF', 'GLOBAL')) NOT NULL,
  address VARCHAR(255),
  contact_email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nif VARCHAR(20) UNIQUE,
  phone VARCHAR(20),
  office_id INT REFERENCES offices(id) ON DELETE SET NULL,
  role_id INT REFERENCES roles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle References
CREATE TABLE IF NOT EXISTS vehicle_makes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_models (
  id SERIAL PRIMARY KEY,
  make_id INT NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(make_id, name)
);

CREATE TABLE IF NOT EXISTS vehicle_colors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  hex_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vin VARCHAR(50) UNIQUE NOT NULL,
  license_plate VARCHAR(20) UNIQUE,
  make VARCHAR(50), -- Can be denormalized or we could use references
  model VARCHAR(50),
  year INT,
  color VARCHAR(30),
  make_id INT REFERENCES vehicle_makes(id) ON DELETE SET NULL,
  model_id INT REFERENCES vehicle_models(id) ON DELETE SET NULL,
  color_id INT REFERENCES vehicle_colors(id) ON DELETE SET NULL,
  seats_count INT DEFAULT 5,
  fuel_type VARCHAR(30),
  vehicle_type VARCHAR(50),
  engine_number VARCHAR(50),
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Immatriculations
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  office_id INT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assurances
CREATE TABLE IF NOT EXISTS insurances (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  office_id INT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  policy_number VARCHAR(50) UNIQUE,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permis de conduire
CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(50) UNIQUE,
  category VARCHAR(10),
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'suspended', 'revoked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Infractions
CREATE TABLE IF NOT EXISTS violations (
  id SERIAL PRIMARY KEY,
  license_id INT REFERENCES licenses(id) ON DELETE SET NULL,
  vehicle_id INT REFERENCES vehicles(id) ON DELETE SET NULL,
  agent_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  violation_type VARCHAR(255) NOT NULL,
  fine_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  violation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requests Table for Users
CREATE TABLE IF NOT EXISTS service_requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'IMMATRICULATION', 'ASSURANCE', 'PERMIS', 'RECLAMATION'
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data
-- role_id mapping used across the entire app:
--   1 = SuperAdmin, 2 = Admin, 3 = Employee, 4 = User
INSERT INTO roles (name) VALUES 
('SuperAdmin'), ('Admin'), ('Employee'), ('User')
ON CONFLICT (name) DO NOTHING;

INSERT INTO offices (name, type) VALUES 
('SIAAH Headquarters', 'GLOBAL'), 
('OAVCT Port-au-Prince', 'OAVCT'), 
('DGI Port-au-Prince', 'DGI'), 
('DCPR Port-au-Prince', 'DCPR')
ON CONFLICT (name) DO NOTHING;

-- Default SuperAdmin user (plain-text password matches auth.controller.js)
-- Credentials: admin@siaah.ht / Admin@2024!
INSERT INTO users (first_name, last_name, email, password, role_id, office_id)
SELECT 'Super', 'Admin', 'admin@siaah.ht', 'Admin@2024!',
       (SELECT id FROM roles  WHERE name = 'SuperAdmin' LIMIT 1),
       (SELECT id FROM offices WHERE name = 'SIAAH Headquarters' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@siaah.ht');
