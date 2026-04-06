-- Super Admin Setup
TRUNCATE TABLE roles CASCADE;
INSERT INTO roles (id, name) VALUES 
(1, 'superadministrateur'),
(2, 'administrateur'),
(3, 'employe'),
(4, 'usager');

CREATE TABLE IF NOT EXISTS entities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure offices has entity_id and created_at
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='entity_id') THEN
        ALTER TABLE offices ADD COLUMN entity_id INTEGER REFERENCES entities(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='created_at') THEN
        ALTER TABLE offices ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Initial entities
INSERT INTO entities (name) VALUES 
('DGI'), ('OAVCT'), ('DCPRT'), ('MEF')
ON CONFLICT (name) DO NOTHING;

-- Seed Super Admin
DELETE FROM users WHERE email = 'superadmin@mef.ht';
INSERT INTO users (first_name, last_name, email, password, role_id) 
VALUES ('Super', 'Admin', 'superadmin@mef.ht', 'password123', 1);
