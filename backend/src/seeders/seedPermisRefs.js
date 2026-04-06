require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

async function seed() {
  const categoriesTable = `
    CREATE TABLE IF NOT EXISTS license_categories (
      id SERIAL PRIMARY KEY,
      code VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    const seedCategories = `
    INSERT INTO license_categories (code, name, description) VALUES
    ('A', 'Catégorie A : Motocyclette', 'Pour les conducteurs de motos et tricycles motorisés.'),
    ('B', 'Catégorie B : Véhicule léger (voiture)', 'Pour les conducteurs de voitures particulières, utilitaires légers.'),
    ('C', 'Catégorie C : Camion', 'Pour les conducteurs de véhicules lourds (camions de plus de 3.5 t).'),
    ('D', 'Catégorie D : Transport en commun', 'Pour les conducteurs de véhicules de transport de personnes (plus de 9 places).'),
    ('E', 'Catégorie E : Véhicule avec remorque', 'Pour les conducteurs de véhicules des catégories B, C ou D attelés d''une remorque lourde.')
    ON CONFLICT (code) DO NOTHING;
  `;

  try {
    await pool.query(categoriesTable);
    console.log('Table license_categories created/verified.');
    await pool.query(seedCategories);
    console.log('license_categories seeded.');
  } catch (err) {
    console.error('Error seeding categories:', err);
  } finally {
    await pool.end();
  }
}

seed();
