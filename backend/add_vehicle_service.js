const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function addService() {
  try {
    const checkRes = await pool.query("SELECT * FROM services WHERE name = 'Gestion des véhicules'");
    if (checkRes.rows.length > 0) {
      console.log("Service 'Gestion des véhicules' already exists.");
    } else {
      await pool.query(`INSERT INTO services (name, description, categorie, actif) 
                       VALUES ('Gestion des véhicules', 'Gestion du parc automobile, suivi des véhicules et statistiques', 'Circulation', true)`);
      console.log("Service 'Gestion des véhicules' added successfully.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

addService();
