require('dotenv').config({ path: __dirname + '/../.env' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

const SERVICES = [
  { name: 'Permis de conduire', description: '' },
  { name: 'Immatriculation', description: '' },
  { name: 'Assurance', description: '' },
  { name: 'Contravention', description: '' }
];

const DEFAULT_OPERATIONS = {
  'Permis de conduire': [
    { name: 'Nouveau permis' },
    { name: 'Renouveler un permis de conduire', description: 'La procédure détaillée pour ce service sera bientôt disponible.' },
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

async function run() {
  await client.connect();
  // Insert services
  const serviceIdMap = {};
  for (const svc of SERVICES) {
    const res = await client.query(
      `INSERT INTO services (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id`,
      [svc.name, svc.description]
    );
    serviceIdMap[svc.name] = res.rows[0].id;
  }
  // Insert operations
  for (const [svcName, ops] of Object.entries(DEFAULT_OPERATIONS)) {
    const svcId = serviceIdMap[svcName];
    for (const op of ops) {
      await client.query(
        `INSERT INTO service_operations (service_id, name, description, required_documents, price, actif)
         VALUES ($1, $2, '', '[]'::jsonb, 0, true)
         ON CONFLICT (service_id, name) DO NOTHING`,
        [svcId, op.name]
      );
    }
  }
  console.log('Default services and operations seeded.');
  await client.end();
}

run().catch(err => { console.error('Seeding error:', err); process.exit(1); });
