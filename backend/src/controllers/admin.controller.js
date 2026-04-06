const { pool } = require('../config/db');

// ─── Statistics ─────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
    const { period = 'month' } = req.query; // day, month, year
    try {
        let evolutionSql = '';
        if (period === 'day') {
            evolutionSql = `
                SELECT TO_CHAR(created_at, 'DD/MM') as label, COUNT(*) as value, MIN(created_at) as sort_key
                FROM users WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days')
                GROUP BY label ORDER BY sort_key ASC`;
        } else if (period === 'year') {
            evolutionSql = `
                SELECT TO_CHAR(created_at, 'YYYY') as label, COUNT(*) as value, MIN(created_at) as sort_key
                FROM users GROUP BY label ORDER BY sort_key ASC`;
        } else {
            // Default: month
            evolutionSql = `
                SELECT TO_CHAR(created_at, 'Mon') as label, COUNT(*) as value, MIN(created_at) as sort_key
                FROM users WHERE created_at >= (CURRENT_DATE - INTERVAL '12 months')
                GROUP BY label ORDER BY sort_key ASC`;
        }

        const [counts, servicesByDept, officesByDept, userEvolution, usersByDept] = await Promise.all([
            pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM entities) as total_entities,
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM users WHERE role_id = 3) as total_employees,
                    (SELECT COUNT(*) FROM offices) as total_offices,
                    (SELECT COUNT(*) FROM services) as total_services
            `),
            pool.query(`
                SELECT COALESCE(u.department, 'Système / MEF') as name, COUNT(sr.id) as services
                FROM service_requests sr
                LEFT JOIN users u ON sr.user_id = u.id
                GROUP BY COALESCE(u.department, 'Système / MEF')
                ORDER BY services DESC
                LIMIT 6
            `),
            pool.query(`
                SELECT COALESCE(departement, 'Système / MEF') as name, COUNT(*) as value
                FROM offices
                GROUP BY COALESCE(departement, 'Système / MEF')
                ORDER BY value DESC
            `),
            pool.query(evolutionSql),
            pool.query(`
                SELECT COALESCE(department, 'Système / MEF') as name, COUNT(*) as value
                FROM users
                GROUP BY COALESCE(department, 'Système / MEF')
                ORDER BY value DESC
            `)
        ]);

        const c = counts.rows[0];
        
        res.json({ 
            status: 'success', 
            data: {
                totalEntities:  parseInt(c.total_entities),
                totalUsers:     parseInt(c.total_users),
                totalEmployees: parseInt(c.total_employees),
                totalOffices:   parseInt(c.total_offices),
                totalServices:  parseInt(c.total_services),
                deptData: servicesByDept.rows.map(r => ({ ...r, services: parseInt(r.services) })),
                officePieData: officesByDept.rows.map(r => ({ ...r, value: parseInt(r.value) })),
                evolutionData: userEvolution.rows.map(r => ({ label: r.label, users: parseInt(r.value) })),
                usersByDept: usersByDept.rows.map(r => ({ ...r, value: parseInt(r.value) }))
            }
        });
    } catch (err) { 
        console.error('Stats Error:', err);
        res.status(500).json({ status: 'error', message: err.message }); 
    }
};

// ─── Entities ────────────────────────────────────────────────────────────────
const getEntities = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, COUNT(DISTINCT o.id) as office_count
            FROM entities e
            LEFT JOIN offices o ON e.id = o.entity_id
            GROUP BY e.id
            ORDER BY e.created_at DESC
        `);
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const createEntity = async (req, res) => {
    const { name, sigle, type_entite, description, date_creation, statut,
            ministere_tutelle, responsable, telephone, email, site_web,
            pays, departement, ville, adresse, code_postal } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO entities
                (name, sigle, type_entite, description, date_creation, statut,
                 ministere_tutelle, responsable, telephone, email, site_web,
                 pays, departement, ville, adresse, code_postal)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING *`,
            [name, sigle, type_entite, description, date_creation || null, statut || 'Actif',
             ministere_tutelle, responsable, telephone, email, site_web,
             pays, departement, ville, adresse, code_postal]
        );
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const updateEntity = async (req, res) => {
    const { id } = req.params;
    const { name, sigle, type_entite, description, date_creation, statut,
            ministere_tutelle, responsable, telephone, email, site_web,
            pays, departement, ville, adresse, code_postal } = req.body;
    try {
        const result = await pool.query(`
            UPDATE entities SET
                name=$1, sigle=$2, type_entite=$3, description=$4, date_creation=$5, statut=$6,
                ministere_tutelle=$7, responsable=$8, telephone=$9, email=$10, site_web=$11,
                pays=$12, departement=$13, ville=$14, adresse=$15, code_postal=$16
            WHERE id=$17 RETURNING *`,
            [name, sigle, type_entite, description, date_creation || null, statut || 'Actif',
             ministere_tutelle, responsable, telephone, email, site_web,
             pays, departement, ville, adresse, code_postal, id]
        );
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const deleteEntity = async (req, res) => {
    const { id } = req.params;
    try {
        // Protect core entities
        const check = await pool.query('SELECT sigle FROM entities WHERE id = $1', [id]);
        if (check.rows.length > 0) {
            const sigle = check.rows[0].sigle;
            if (['DGI', 'OAVCT', 'DCPR'].includes(sigle)) {
                return res.status(403).json({ status: 'error', message: 'Cette entité système ne peut pas être supprimée.' });
            }
        }
        await pool.query('DELETE FROM entities WHERE id = $1', [id]);
        res.json({ status: 'success', message: 'Entité supprimée' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

// ─── Entity ↔ Services ───────────────────────────────────────────────────────
const getEntityServices = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.* FROM services s
            JOIN entity_services es ON es.service_id = s.id
            WHERE es.entity_id = $1
            ORDER BY s.categorie, s.name
        `, [req.params.id]);
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const setEntityServices = async (req, res) => {
    const { id } = req.params;
    const { service_ids = [] } = req.body;   // full replacement
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM entity_services WHERE entity_id = $1', [id]);
        if (service_ids.length > 0) {
            const vals = service_ids.map((sid, i) => `($1, $${i + 2})`).join(',');
            await client.query(`INSERT INTO entity_services (entity_id, service_id) VALUES ${vals}`,
                [id, ...service_ids]);
        }
        await client.query('COMMIT');
        res.json({ status: 'success', message: 'Services mis à jour' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ status: 'error', message: err.message });
    } finally { client.release(); }
};

// ─── Offices ─────────────────────────────────────────────────────────────────
const getOffices = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, e.name as entity_name
            FROM offices o
            LEFT JOIN entities e ON o.entity_id = e.id
            ORDER BY o.created_at DESC
        `);
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const createOffice = async (req, res) => {
    const { name, entity_id, code, departement, commune, quartier, adresse,
            latitude, longitude, telephone, email,
            responsable_nom, responsable_fonction, responsable_telephone, responsable_email,
            type_bureau, heures_ouverture, statut, date_ouverture } = req.body;
    try {
        const finalStatus = statut || 'Actif';
        // Map type_bureau to type if it matches system types, otherwise use 'GLOBAL'
        const sysTypes = ['OAVCT', 'DGI', 'DCPR', 'MEF', 'GLOBAL'];
        let typeVal = 'GLOBAL';
        if (type_bureau && sysTypes.includes(type_bureau.toUpperCase())) {
            typeVal = type_bureau.toUpperCase();
        }

        const result = await pool.query(`
            INSERT INTO offices
                (name, entity_id, code, departement, commune, quartier, adresse, location,
                 latitude, longitude, telephone, email,
                 responsable_nom, responsable_fonction, responsable_telephone, responsable_email,
                 type_bureau, type, heures_ouverture, statut, date_ouverture)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
            RETURNING *`,
            [name, entity_id, code, departement, commune, quartier, adresse, adresse,
             latitude, longitude, telephone, email,
             responsable_nom, responsable_fonction, responsable_telephone, responsable_email,
             type_bureau, typeVal, heures_ouverture, finalStatus, date_ouverture || null]
        );
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const updateOffice = async (req, res) => {
    const { id } = req.params;
    const { name, entity_id, code, departement, commune, quartier, adresse,
            latitude, longitude, telephone, email,
            responsable_nom, responsable_fonction, responsable_telephone, responsable_email,
            type_bureau, heures_ouverture, statut, date_ouverture } = req.body;
    try {
        const sysTypes = ['OAVCT', 'DGI', 'DCPR', 'MEF', 'GLOBAL'];
        let typeVal = 'GLOBAL';
        if (type_bureau && sysTypes.includes(type_bureau.toUpperCase())) {
            typeVal = type_bureau.toUpperCase();
        }

        const result = await pool.query(`
            UPDATE offices SET
                name=$1, entity_id=$2, code=$3, departement=$4, commune=$5,
                quartier=$6, adresse=$7, location=$8, latitude=$9, longitude=$10,
                telephone=$11, email=$12, responsable_nom=$13, responsable_fonction=$14,
                responsable_telephone=$15, responsable_email=$16, type_bureau=$17,
                type=$18, heures_ouverture=$19, statut=$20, date_ouverture=$21
            WHERE id=$22 RETURNING *`,
            [name, entity_id, code, departement, commune, quartier, adresse, adresse,
             latitude, longitude, telephone, email,
             responsable_nom, responsable_fonction, responsable_telephone, responsable_email,
             type_bureau, typeVal, heures_ouverture, statut || 'Actif', date_ouverture || null, id]
        );
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const deleteOffice = async (req, res) => {
    try {
        await pool.query('DELETE FROM offices WHERE id = $1', [req.params.id]);
        res.json({ status: 'success', message: 'Bureau supprimé' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

// ─── Services ────────────────────────────────────────────────────────────────
const getServices = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*,
                   COUNT(DISTINCT es.entity_id) as entity_count,
                   COALESCE(
                       json_agg(DISTINCT jsonb_build_object('id', e.id, 'name', e.name))
                       FILTER (WHERE e.id IS NOT NULL), '[]'
                   ) as entities,
                   COALESCE(
                       (SELECT json_agg(op ORDER BY op.name) 
                        FROM service_operations op 
                        WHERE op.service_id = s.id), '[]'
                   ) as operations
            FROM services s
            LEFT JOIN entity_services es ON es.service_id = s.id
            LEFT JOIN entities e ON e.id = es.entity_id
            GROUP BY s.id
            ORDER BY s.categorie, s.name
        `);
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const createService = async (req, res) => {
    const { name, description, categorie, actif = true, entity_ids = [], required_documents = [], operations = [] } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const svc = await client.query(
            'INSERT INTO services (name, description, categorie, actif, required_documents) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [name, description, categorie, actif, JSON.stringify(required_documents)]
        );
        const sid = svc.rows[0].id;
        
        // Entity linkage
        if (entity_ids.length > 0) {
            const vals = entity_ids.map((eid, i) => `($${i + 1}, $${entity_ids.length + 1})`).join(',');
            await client.query(`INSERT INTO entity_services (entity_id, service_id) VALUES ${vals}`,
                [...entity_ids, sid]);
        }

        // Operations
        if (operations.length > 0) {
            for (const op of operations) {
                await client.query(
                    'INSERT INTO service_operations (service_id, name, description, required_documents, price, actif) VALUES ($1, $2, $3, $4, $5, $6)',
                    [sid, op.name, op.description, JSON.stringify(op.required_documents || []), op.price || 0, op.actif]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ status: 'success', data: svc.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ status: 'error', message: err.message });
    } finally { client.release(); }
};

const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, description, categorie, actif, entity_ids, required_documents, operations } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        let updateQuery = 'UPDATE services SET name=$1, description=$2, categorie=$3, actif=$4';
        let params = [name, description, categorie, actif];
        
        if (required_documents !== undefined) {
          updateQuery += ', required_documents=$' + (params.length + 1);
          params.push(JSON.stringify(required_documents));
        }
        
        updateQuery += ' WHERE id=$' + (params.length + 1) + ' RETURNING *';
        params.push(id);

        const result = await client.query(updateQuery, params);

        if (Array.isArray(entity_ids)) {
            await client.query('DELETE FROM entity_services WHERE service_id = $1', [id]);
            if (entity_ids.length > 0) {
                const vals = entity_ids.map((eid, i) => `($${i + 1}, $${entity_ids.length + 1})`).join(',');
                await client.query(`INSERT INTO entity_services (entity_id, service_id) VALUES ${vals}`,
                    [...entity_ids, id]);
            }
        }

        if (Array.isArray(operations)) {
            // Get existing operations to identify deletions
            const existingOps = await client.query('SELECT id FROM service_operations WHERE service_id = $1', [id]);
            const existingIds = existingOps.rows.map(r => r.id);
            const incomingIds = operations.filter(op => op.id).map(op => op.id);
            
            // Delete missing operations
            const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));
            if (toDelete.length > 0) {
                await client.query('DELETE FROM service_operations WHERE id = ANY($1)', [toDelete]);
            }

            // Update/Insert operations
            for (const op of operations) {
                if (op.id) {
                    await client.query(
                        'UPDATE service_operations SET name=$1, description=$2, required_documents=$3, price=$4, actif=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6',
                        [op.name, op.description, JSON.stringify(op.required_documents || []), op.price || 0, op.actif, op.id]
                    );
                } else {
                    await client.query(
                        'INSERT INTO service_operations (service_id, name, description, required_documents, price, actif) VALUES ($1, $2, $3, $4, $5, $6)',
                        [id, op.name, op.description, JSON.stringify(op.required_documents || []), op.price || 0, op.actif]
                    );
                }
            }
        }

        await client.query('COMMIT');
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ status: 'error', message: err.message });
    } finally { client.release(); }
};

const deleteService = async (req, res) => {
    try {
        await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
        res.json({ status: 'success', message: 'Service supprimé' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};
// ─── Service Operations ──────────────────────────────────────────────────────
const createOperation = async (req, res) => {
    const { service_id, name, description, required_documents, price, actif = true } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO service_operations (service_id, name, description, required_documents, price, actif) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [service_id, name, description, JSON.stringify(required_documents || []), price || 0, actif]
        );
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const updateOperation = async (req, res) => {
    const { id } = req.params;
    const { name, description, required_documents, price, actif } = req.body;
    try {
        const result = await pool.query(
            'UPDATE service_operations SET name=$1, description=$2, required_documents=$3, price=$4, actif=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
            [name, description, JSON.stringify(required_documents), price || 0, actif, id]
        );
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const deleteOperation = async (req, res) => {
    try {
        await pool.query('DELETE FROM service_operations WHERE id = $1', [req.params.id]);
        res.json({ status: 'success', message: 'Opération supprimée' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};
// ─── Users ───────────────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.*,
                   r.name as role_name, o.name as office_name, e.name as entity_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN offices o ON u.office_id = o.id
            LEFT JOIN entities e ON o.entity_id = e.id
            ORDER BY u.id DESC
        `);
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const getRoles = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM roles ORDER BY id');
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const createUser = async (req, res) => {
    const { first_name, last_name, email, password, nif, phone, role_id, office_id, assigned_services = [] } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, nif, phone, role_id, office_id, assigned_services)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [first_name, last_name, email, password, nif, phone, role_id, office_id || null, JSON.stringify(assigned_services)]
        );
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, password, nif, phone, role_id, office_id, assigned_services = [] } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users SET
                first_name=$1, last_name=$2, email=$3, password=COALESCE($4, password),
                nif=$5, phone=$6, role_id=$7, office_id=$8, assigned_services=$9
             WHERE id=$10 RETURNING *`,
            [first_name, last_name, email, password || null, nif, phone, role_id, office_id || null, JSON.stringify(assigned_services), id]
        );
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const deleteUser = async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ status: 'success', message: 'Utilisateur supprimé' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const getUserDetail = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch user basic info
        const userResult = await pool.query(`
            SELECT u.*, r.name as role_name, o.name as office_name, e.name as entity_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN offices o ON u.office_id = o.id
            LEFT JOIN entities e ON o.entity_id = e.id
            WHERE u.id = $1
        `, [id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });
        }

        const user = userResult.rows[0];

        // Fetch their requests (demarches)
        const requestsResult = await pool.query(`
            SELECT sr.*, s.name as service_name, s.categorie as service_categorie
            FROM service_requests sr
            LEFT JOIN services s ON sr.type = s.name
            WHERE sr.user_id = $1
            ORDER BY sr.created_at DESC
        `, [id]);

        // Fetch their vehicles
        const vehiclesResult = await pool.query(`
            SELECT * FROM vehicles WHERE owner_id = $1 ORDER BY created_at DESC
        `, [id]);

        // Fetch their licenses (assuming table driver_licenses exists)
        let licenses = [];
        try {
            const licensesResult = await pool.query(`
                SELECT * FROM driver_licenses WHERE user_id = $1 ORDER BY created_at DESC
            `, [id]);
            licenses = licensesResult.rows;
        } catch (e) {
            console.warn('driver_licenses table might not exist yet');
        }

        res.json({
            status: 'success',
            data: {
                ...user,
                requests: requestsResult.rows,
                vehicles: vehiclesResult.rows,
                licenses: licenses
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { 
        first_name, last_name, sexe, dob, pob, 
        nationality, cin, marital_status, blood_group,
        city, department, country, full_address,
        phone, phone2, nif, note_somaire
    } = req.body;

    try {
        const sql = `
            UPDATE users SET 
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                sexe = COALESCE($3, sexe),
                dob = COALESCE($4, dob),
                pob = COALESCE($5, pob),
                nationality = COALESCE($6, nationality),
                cin = COALESCE($7, cin),
                marital_status = COALESCE($8, marital_status),
                blood_group = COALESCE($9, blood_group),
                city = COALESCE($10, city),
                department = COALESCE($11, department),
                country = COALESCE($12, country),
                full_address = COALESCE($13, full_address),
                address = COALESCE($13, address),
                phone = COALESCE($14, phone),
                phone2 = COALESCE($15, phone2),
                nif = COALESCE($16, nif),
                note_somaire = COALESCE($17, note_somaire)
            WHERE id = $18 RETURNING *
        `;
        
        const params = [
            first_name, last_name, sexe, dob, pob, 
            nationality, cin, marital_status, blood_group,
            city, department, country, full_address,
            phone, phone2, nif, note_somaire,
            id
        ];

        const result = await pool.query(sql, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({ status: 'success', data: result.rows[0], message: 'Profil mis à jour' });
    } catch (err) {
        console.error('Update User Profile Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const updateUserAvatar = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'Aucun fichier uploadé' });
        }
        
        const photoPath = req.file.filename;

        const result = await pool.query(
            'UPDATE users SET photo = $1 WHERE id = $2 RETURNING *',
            [photoPath, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({ status: 'success', photo: photoPath, message: 'Avatar mis à jour' });
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const getUserCommunications = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT c.*, 
                   u.first_name as sender_first_name, u.last_name as sender_last_name
            FROM communications c
            LEFT JOIN users u ON c.sender_id = u.id
            WHERE c.user_id = $1
            ORDER BY c.sent_at DESC
        `, [id]);
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error('Error fetching communications:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const globalSearch = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ status: 'error', message: 'Recherche vide' });

    try {
        // 1. Try to find by Request ID (D-123 or just 123)
        let requestId = null;
        const qUpper = query.trim().toUpperCase();
        if (qUpper.startsWith('D-')) {
            requestId = parseInt(qUpper.substring(2));
        } else if (/^\d+$/.test(qUpper)) {
            requestId = parseInt(qUpper);
        }

        if (requestId && !isNaN(requestId)) {
            const reqRes = await pool.query(`
                SELECT sr.*, s.name as service_name, u.first_name, u.last_name, u.email
                FROM service_requests sr
                LEFT JOIN services s ON sr.type = s.name
                LEFT JOIN users u ON sr.user_id = u.id
                WHERE sr.id = $1
            `, [requestId]);
            if (reqRes.rows.length > 0) {
                return res.json({ status: 'success', type: 'request', data: reqRes.rows[0] });
            }
        }

        // 2. Search in Users (Name, Email, NIF, Phone)
        const userRes = await pool.query(`
            SELECT u.*, r.name as role_name 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.first_name ILIKE $1 
               OR u.last_name ILIKE $1 
               OR u.email ILIKE $1 
               OR u.nif ILIKE $1 
               OR u.phone ILIKE $1
            LIMIT 5
        `, [`%${query.trim()}%`]);

        if (userRes.rows.length > 0) {
            return res.json({ status: 'success', type: 'user', data: userRes.rows[0], allResults: userRes.rows });
        }

        res.status(404).json({ status: 'error', message: 'Aucun résultat trouvé' });
    } catch (err) {
        console.error('Global search error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = {
    getStats,
    getEntities, createEntity, updateEntity, deleteEntity,
    getEntityServices, setEntityServices,
    getOffices, createOffice, updateOffice, deleteOffice,
    getServices, createService, updateService, deleteService,
    getUsers, getRoles, createUser, updateUser, deleteUser,
    getUserDetail, updateUserProfile, updateUserAvatar,
    getUserCommunications, globalSearch,
    createOperation, updateOperation, deleteOperation
};
