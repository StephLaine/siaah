const pool = require('./src/config/db');

async function createAdmin() {
    try {
        // Find entities and offices
        const resOffices = await pool.query('SELECT o.id, o.name, e.name as entity_name FROM offices o JOIN entities e ON o.entity_id = e.id WHERE e.sigle = $1 LIMIT 1', ['DGI']);
        
        let office_id = null;
        let entity_name = '';
        if (resOffices.rows.length > 0) {
            office_id = resOffices.rows[0].id;
            entity_name = resOffices.rows[0].entity_name;
        } else {
            console.log('No DGI office found. Getting any office...');
            const anyOffice = await pool.query('SELECT o.id, o.name, e.name as entity_name FROM offices o JOIN entities e ON o.entity_id = e.id LIMIT 1');
            if (anyOffice.rows.length > 0) {
                office_id = anyOffice.rows[0].id;
                entity_name = anyOffice.rows[0].entity_name;
            } else {
                console.log('No offices exist at all. Creating dummy one.');
                await pool.query('INSERT INTO entities (name, sigle, type) VALUES ($1, $2, $3)', ['Ministry of Magic', 'MoM', 'ministère']);
                const newEnt = await pool.query('SELECT id FROM entities ORDER BY id DESC LIMIT 1');
                await pool.query('INSERT INTO offices (name, entity_id, status) VALUES ($1, $2, $3)', ['Bureau Admin', newEnt.rows[0].id, 'actif']);
                const newOff = await pool.query('SELECT id FROM offices ORDER BY id DESC LIMIT 1');
                office_id = newOff.rows[0].id;
                entity_name = 'Ministry of Magic';
            }
        }

        console.log(`Using office_id=${office_id} for entity ${entity_name}`);

        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password, role_id, office_id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO UPDATE SET role_id=$5, office_id=$6 RETURNING id, email',
            ['Admin', 'Entity', 'admin@dgi.ht', 'password1', 2, office_id]
        );

        console.log(`Created admin user!
Email: ${result.rows[0].email}
Password: password1
Entity: ${entity_name}
Office ID: ${office_id}
Role ID: 2 (Admin)
`);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        pool.end();
    }
}

createAdmin();
