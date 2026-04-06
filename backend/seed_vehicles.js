const { pool } = require('./src/config/db');

const makes = [
    'Toyota', 'Honda', 'Hyundai', 'Nissan', 'Kia', 
    'Ford', 'Chevrolet', 'Volkswagen', 'BMW', 'Mercedes-Benz',
    'Audi', 'Jeep', 'Mazda', 'Lexus', 'Subaru', 'Yamaha', 'Suzuki'
];

const models = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Hilux', 'Land Cruiser', 'Prius'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Fit', 'Pilot'],
    'Hyundai': ['Elantra', 'Tucson', 'Santa Fe', 'Accent', 'Ioniq'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Patrol', 'Versa'],
    'Kia': ['Sportage', 'Sorento', 'Rio', 'Soul', 'Stinger'],
    'Ford': ['F-150', 'Escape', 'Explorer', 'Mustang', 'Ranger'],
    'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Spark'],
    'Volkswagen': ['Golf', 'Jetta', 'Tiguan', 'Passat', 'Polo'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M3'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
    'Yamaha': ['YZF-R1', 'MT-07', 'V-Star', 'FZ-09'],
    'Suzuki': ['Swift', 'Jimny', 'Vitara', 'Hayabusa', 'GSX-R']
};

const colors = ['Blanc', 'Noir', 'Gris Argent', 'Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Marron', 'Beige'];

async function seed() {
    console.log('--- Starting Vehicle Seeding ---');
    try {
        // Clear existing (optional, but let's just insert)
        // Insert Colors
        for (const color of colors) {
            await pool.query('INSERT INTO vehicle_colors (name) VALUES ($1) ON CONFLICT DO NOTHING', [color]);
        }
        console.log('Colors seeded.');

        // Insert Makes and Models
        for (const makeName of makes) {
            const makeRes = await pool.query('INSERT INTO vehicle_makes (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id', [makeName]);
            const makeId = makeRes.rows[0].id;
            
            const makeModels = models[makeName] || [];
            for (const modelName of makeModels) {
                await pool.query('INSERT INTO vehicle_models (make_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [makeId, modelName]);
            }
        }
        console.log('Makes and Models seeded.');
        console.log('--- Seeding Completed successfully ---');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        process.exit();
    }
}

seed();
