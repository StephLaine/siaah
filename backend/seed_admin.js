require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

async function run() {
    try {
        const dgiOffice = await pool.query(`
            SELECT o.id, o.name, e.name as entity_name 
            FROM offices o 
            JOIN entities e ON o.entity_id = e.id 
            WHERE e.sigle = 'DGI' 
            LIMIT 1
        `);
        
        let office_id = null;
        if (dgiOffice.rows.length > 0) {
            office_id = dgiOffice.rows[0].id;
            console.log("Trouvé bureau pour DGI:", dgiOffice.rows[0].name);
        } else {
            // Find any office if DGI isn't seeded for some reason
            const anyOffice = await pool.query('SELECT o.id, o.name, e.name as entity_name FROM offices o JOIN entities e ON o.entity_id = e.id LIMIT 1');
            if (anyOffice.rows.length > 0) {
                office_id = anyOffice.rows[0].id;
                console.log("Utilisation du bureau par défaut:", anyOffice.rows[0].name);
            } else {
                 console.log("Erreur : Aucun bureau (office) n'a été trouvé dans la base de données. Créez un bureau d'abord.");
                 return;
            }
        }
        
        // Ensure role 2 is present (Admin)
        await pool.query("INSERT INTO roles (id, name) VALUES (2, 'Administrateur') ON CONFLICT (id) DO NOTHING");
        
        const email = 'admin@dgi.ht';
        const password = 'password123';
        
        await pool.query(`
            INSERT INTO users (first_name, last_name, email, password, role_id, office_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            ON CONFLICT (email) 
            DO UPDATE SET role_id = EXCLUDED.role_id, office_id = EXCLUDED.office_id
        `, ['Marc', 'Antoine (Admin)', email, password, 2, office_id]);
        
        console.log("Succès ! Compte administrateur créé.");
        console.log("====================================");
        console.log("Email : admin@dgi.ht");
        console.log("Mot de passe : password123");
        console.log("Bureau ID :", office_id);
        console.log("Rôle : Administrateur (Entité)");
        console.log("====================================");
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
