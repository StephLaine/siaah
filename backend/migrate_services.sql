-- ============================================================
-- SIAAH Services Module Migration
-- Run this against your PostgreSQL database
-- ============================================================

-- 1. Services table
CREATE TABLE IF NOT EXISTS services (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    categorie   VARCHAR(100),
    actif       BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Junction: which services belong to which entity
CREATE TABLE IF NOT EXISTS entity_services (
    entity_id   INT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    service_id  INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (entity_id, service_id)
);

-- 3. Extend entities table with new rich columns (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='sigle') THEN
        ALTER TABLE entities ADD COLUMN sigle VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='type_entite') THEN
        ALTER TABLE entities ADD COLUMN type_entite VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='description') THEN
        ALTER TABLE entities ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='statut') THEN
        ALTER TABLE entities ADD COLUMN statut VARCHAR(20) DEFAULT 'Actif';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='ministere_tutelle') THEN
        ALTER TABLE entities ADD COLUMN ministere_tutelle VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='responsable') THEN
        ALTER TABLE entities ADD COLUMN responsable VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='telephone') THEN
        ALTER TABLE entities ADD COLUMN telephone VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='email') THEN
        ALTER TABLE entities ADD COLUMN email VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='site_web') THEN
        ALTER TABLE entities ADD COLUMN site_web VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='pays') THEN
        ALTER TABLE entities ADD COLUMN pays VARCHAR(100) DEFAULT 'Haïti';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='departement') THEN
        ALTER TABLE entities ADD COLUMN departement VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='ville') THEN
        ALTER TABLE entities ADD COLUMN ville VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='adresse') THEN
        ALTER TABLE entities ADD COLUMN adresse VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='code_postal') THEN
        ALTER TABLE entities ADD COLUMN code_postal VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='date_creation') THEN
        ALTER TABLE entities ADD COLUMN date_creation DATE;
    END IF;
END $$;

-- 4. Extend offices with new rich columns (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='code') THEN
        ALTER TABLE offices ADD COLUMN code VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='departement') THEN
        ALTER TABLE offices ADD COLUMN departement VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='commune') THEN
        ALTER TABLE offices ADD COLUMN commune VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='quartier') THEN
        ALTER TABLE offices ADD COLUMN quartier VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='adresse') THEN
        ALTER TABLE offices ADD COLUMN adresse VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='latitude') THEN
        ALTER TABLE offices ADD COLUMN latitude VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='longitude') THEN
        ALTER TABLE offices ADD COLUMN longitude VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='email') THEN
        ALTER TABLE offices ADD COLUMN email VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='telephone') THEN
        ALTER TABLE offices ADD COLUMN telephone VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='responsable_nom') THEN
        ALTER TABLE offices ADD COLUMN responsable_nom VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='responsable_fonction') THEN
        ALTER TABLE offices ADD COLUMN responsable_fonction VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='responsable_telephone') THEN
        ALTER TABLE offices ADD COLUMN responsable_telephone VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='responsable_email') THEN
        ALTER TABLE offices ADD COLUMN responsable_email VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='type_bureau') THEN
        ALTER TABLE offices ADD COLUMN type_bureau VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='heures_ouverture') THEN
        ALTER TABLE offices ADD COLUMN heures_ouverture VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='statut') THEN
        ALTER TABLE offices ADD COLUMN statut VARCHAR(30) DEFAULT 'Actif';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offices' AND column_name='date_ouverture') THEN
        ALTER TABLE offices ADD COLUMN date_ouverture DATE;
    END IF;
END $$;

-- ============================================================
-- 5. Seed initial services
-- ============================================================

-- DGI Services
INSERT INTO services (name, description, categorie) VALUES
    ('Immatriculation fiscale (NIF)', 'Délivrance et gestion du Numéro d''Identification Fiscale', 'Immatriculation'),
    ('Paiement des impôts', 'Paiement des impôts de toute nature', 'Paiement'),
    ('Impôt sur le revenu', 'Déclaration et paiement de l''impôt sur le revenu des personnes physiques', 'Impôts'),
    ('Impôt sur les entreprises', 'Déclaration et paiement de l''impôt sur les bénéfices des entreprises', 'Impôts'),
    ('Patente (licence commerciale)', 'Délivrance de la patente commerciale obligatoire', 'Licences'),
    ('Enregistrement des actes de vente', 'Enregistrement officiel des actes de vente de terrain', 'Enregistrement'),
    ('Enregistrement de contrats', 'Enregistrement et légalisation de contrats', 'Enregistrement'),
    ('Enregistrement de donations', 'Formalités liées aux donations de biens', 'Enregistrement'),
    ('Paiement des taxes immobilières', 'Calcul et paiement de la taxe foncière', 'Paiement'),
    ('Quitus fiscal', 'Délivrance du certificat de situation fiscale', 'Certificats'),
    ('Déclaration fiscale', 'Dépôt des déclarations fiscales annuelles', 'Déclarations'),
    ('Timbres fiscaux', 'Vente et validation de timbres fiscaux', 'Timbres')
ON CONFLICT DO NOTHING;

-- OAVCT Services
INSERT INTO services (name, description, categorie) VALUES
    ('Assurance obligatoire des véhicules', 'Souscription à l''assurance obligatoire OAVCT pour tout véhicule', 'Assurance'),
    ('Renouvellement d''assurance', 'Renouvellement annuel de la police d''assurance', 'Assurance'),
    ('Paiement de prime d''assurance', 'Paiement de la prime d''assurance véhicule', 'Paiement'),
    ('Déclaration d''accident', 'Déclaration et traitement d''un sinistre automobile', 'Sinistres'),
    ('Indemnisation des victimes d''accidents', 'Procédure d''indemnisation des victimes d''accidents de la route', 'Sinistres'),
    ('Attestation d''assurance', 'Délivrance de l''attestation prouvant la couverture', 'Certificats')
ON CONFLICT DO NOTHING;

-- DCPR Services
INSERT INTO services (name, description, categorie) VALUES
    ('Contrôle de la circulation', 'Régulation et contrôle du trafic routier', 'Circulation'),
    ('Gestion des accidents de la route', 'Intervention et gestion des accidents', 'Accidents'),
    ('Constat d''accident', 'Établissement du constat officiel d''accident', 'Accidents'),
    ('Application du code de la route', 'Contrôle du respect du code de la route', 'Réglementation'),
    ('Contrôle des documents de véhicules', 'Vérification des documents obligatoires (permis, assurance, immatriculation)', 'Contrôle'),
    ('Sécurité routière', 'Campagnes et actions de sensibilisation à la sécurité routière', 'Prévention')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. Assign services to entities (by name lookup)
-- ============================================================

-- Assign DGI services
INSERT INTO entity_services (entity_id, service_id)
SELECT e.id, s.id FROM entities e, services s
WHERE e.name = 'DGI'
AND s.name IN (
    'Immatriculation fiscale (NIF)', 'Paiement des impôts', 'Impôt sur le revenu',
    'Impôt sur les entreprises', 'Patente (licence commerciale)',
    'Enregistrement des actes de vente', 'Enregistrement de contrats',
    'Enregistrement de donations', 'Paiement des taxes immobilières',
    'Quitus fiscal', 'Déclaration fiscale', 'Timbres fiscaux'
)
ON CONFLICT DO NOTHING;

-- Assign OAVCT services
INSERT INTO entity_services (entity_id, service_id)
SELECT e.id, s.id FROM entities e, services s
WHERE e.name = 'OAVCT'
AND s.name IN (
    'Assurance obligatoire des véhicules', 'Renouvellement d''assurance',
    'Paiement de prime d''assurance', 'Déclaration d''accident',
    'Indemnisation des victimes d''accidents', 'Attestation d''assurance'
)
ON CONFLICT DO NOTHING;

-- Assign DCPR / DCPRT services
INSERT INTO entity_services (entity_id, service_id)
SELECT e.id, s.id FROM entities e, services s
WHERE e.name IN ('DCPR', 'DCPRT')
AND s.name IN (
    'Contrôle de la circulation', 'Gestion des accidents de la route',
    'Constat d''accident', 'Application du code de la route',
    'Contrôle des documents de véhicules', 'Sécurité routière'
)
ON CONFLICT DO NOTHING;
