// add_default_services_to_entities.js
// This script assigns core default services to all entities so they appear in the Super Admin dashboard.
require('dotenv').config();
const { pool } = require('./src/config/db');

// Core public service names (matching those seeded)
const corePublicNames = ['Permis de conduire', 'Immatriculation', 'Assurance', 'Contravention'];

(async () => {
  try {
    // Fetch all entity IDs
    const entitiesRes = await pool.query('SELECT id FROM entities');
    const entityIds = entitiesRes.rows.map(r => r.id);
    if (entityIds.length === 0) {
      console.log('No entities found. Skipping linking.');
      process.exit(0);
    }

    // Fetch services that are core (by name match) and not already linked to all entities
    const servicesRes = await pool.query(
      `SELECT id FROM services WHERE name = ANY($1)`,
      [corePublicNames]
    );
    const serviceIds = servicesRes.rows.map(r => r.id);
    if (serviceIds.length === 0) {
      console.log('No core services found.');
      process.exit(0);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // For each service, insert missing entity links
      for (const sid of serviceIds) {
        // Find existing links to avoid duplicates
        const existingRes = await client.query(
          'SELECT entity_id FROM entity_services WHERE service_id = $1',
          [sid]
        );
        const existingIds = existingRes.rows.map(r => r.entity_id);
        const missingIds = entityIds.filter(eid => !existingIds.includes(eid));
        if (missingIds.length > 0) {
          const values = missingIds.map((eid, i) => `($${i + 1}, $${missingIds.length + 1})`).join(',');
          await client.query(
            `INSERT INTO entity_services (entity_id, service_id) VALUES ${values}`,
            [...missingIds, sid]
          );
          console.log(`Linked service ${sid} to ${missingIds.length} entities.`);
        }
      }
      await client.query('COMMIT');
      console.log('Default services linked to all entities successfully.');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error linking default services:', e);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
})();
