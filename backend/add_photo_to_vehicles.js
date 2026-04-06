const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

async function addPhotoColumn() {
    try {
        await client.connect();
        // Vérifier si la colonne existe (juste au cas où)
        const checkRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vehicles' AND column_name = 'photo_url'
        `);
        
        if (checkRes.rows.length === 0) {
            await client.query('ALTER TABLE vehicles ADD COLUMN photo_url VARCHAR(255)');
            console.log('Colonne photo_url ajoutée avec succès.');
        } else {
            console.log('La colonne photo_url existe déjà.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

addPhotoColumn();
