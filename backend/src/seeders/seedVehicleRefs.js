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
  const tables = `
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
  `;

  try {
    console.log('Creating tables...');
    await pool.query(tables);
    // 1. Seed Makes
    const makes = ['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Suzuki', 'Isuzu', 'Mitsubishi'];
    console.log('Seeding makes...');
    for (const make of makes) {
      await pool.query('INSERT INTO vehicle_makes (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [make]);
    }

    // 2. Fetch Make IDs for Models
    const makeRes = await pool.query('SELECT id, name FROM vehicle_makes');
    const makeMap = {};
    makeRes.rows.forEach(r => makeMap[r.name] = r.id);

    // 3. Seed Models
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

    console.log('Seeding models...');
    for (const model of models) {
      const makeId = makeMap[model.make];
      if (makeId) {
        await pool.query('INSERT INTO vehicle_models (make_id, name) VALUES ($1, $2) ON CONFLICT (make_id, name) DO NOTHING', [makeId, model.name]);
      }
    }

    // 4. Seed Colors
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

    console.log('Seeding colors...');
    for (const color of colors) {
      await pool.query('INSERT INTO vehicle_colors (name, hex_code) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [color.name, color.hex]);
    }

    console.log('Vehicle reference data seeded successfully.');
  } catch (err) {
    console.error('Error seeding vehicle refs:', err);
  } finally {
    await pool.end();
  }
}

seed();
