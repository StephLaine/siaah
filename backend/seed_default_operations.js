require('dotenv').config({ path: __dirname + '/.env' });
const { Client } = require('pg');

const dbUrl = new URL(process.env.DATABASE_URL.trim());
const client = new Client({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace(/^\//, ''),
  ssl: { rejectUnauthorized: false }
});

const DEFAULT_OPERATIONS = {
  'Permis de conduire': [
    { name: 'Nouveau permis', actif: true, required_documents: [], price: 0 },
    { name: 'Renouveler un permis de conduire', description: 'La procédure détaillée pour ce service sera bientôt disponible.', actif: true, required_documents: [], price: 0 },
    { name: 'Corriger un permis', actif: true, required_documents: [], price: 0 },
    { name: 'Remplacer un permis', actif: true, required_documents: [], price: 0 }
  ],
  'Immatriculation': [
    { name: 'Immatriculer un véhicule', actif: true, required_documents: [], price: 0 },
    { name: "Renouveler une plaque d'immatriculation", actif: true, required_documents: [], price: 0 },
    { name: 'Transférer un Véhicule', actif: true, required_documents: [], price: 0 },
    { name: 'Remplacer une Plaque', actif: true, required_documents: [], price: 0 }
  ],
  'Assurance': [
    { name: "Faire une Demande d'Assurance", actif: true, required_documents: [], price: 0 },
    { name: 'Renouveler une Assurance', actif: true, required_documents: [], price: 0 }
  ],
  'Contravention': [
    { name: 'Nouvelle contravention', actif: true, required_documents: [], price: 0 },
    { name: 'Payer contravention', actif: true, required_documents: [], price: 0 }
  ]
};

async function run() {
  try {
    await client.connect();
    console.log('Seeding default operations...');

    const serviceNames = Object.keys(DEFAULT_OPERATIONS);
    const { rows: services } = await client.query(
      `SELECT id, name FROM services WHERE name = ANY($1)`,
      [serviceNames]
    );

    for (const svc of services) {
      const ops = DEFAULT_OPERATIONS[svc.name] || [];
      for (const op of ops) {
        await client.query(
          `INSERT INTO service_operations (service_id, name, description, required_documents, price, actif)
SELECT $1, $2::varchar, $3, $4, $5, $6
WHERE NOT EXISTS (SELECT 1 FROM service_operations WHERE service_id = $1 AND name = $2)`,
          [
            svc.id,
            op.name,
            '',
            JSON.stringify(op.required_documents),
            op.price,
            op.actif
          ]
        );
      }
    }

    console.log('Default operations seeded.');
  } catch (e) {
    console.error('Error seeding operations:', e);
  } finally {
    await client.end();
  }
}

run();
