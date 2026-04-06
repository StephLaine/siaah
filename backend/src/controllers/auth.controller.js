const { pool } = require('../config/db');
const { generateToken } = require('../utils/auth.utils');
const { sendWelcomeEmail } = require('../utils/email.service');

const register = async (req, res) => {
    const { first_name, last_name, email, password, nif, role_id, office_id } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password, nif, role_id, office_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [first_name, last_name, email, password, nif, role_id || 4, office_id || null]
        );

        const user = { id: result.rows[0].id, first_name, last_name, email, role_id: role_id || 4, office_id: office_id || null };
        const token = generateToken(user);

        // Send welcome email asynchronously
        sendWelcomeEmail(user, password).catch(err => console.error('Failed to send welcome email:', err));

        res.status(201).json({ status: 'success', data: { user, token } });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = `
            SELECT u.*, o.name as office_name, e.name as entity_name, e.sigle as entity_sigle
            FROM users u
            LEFT JOIN offices o ON u.office_id = o.id
            LEFT JOIN entities e ON o.entity_id = e.id
            WHERE u.email = $1
        `;
        const result = await pool.query(query, [email]);
        const user = result.rows[0];

        if (!user || user.password !== password) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        // Fetch entity services if user is an admin
        let entityServices = [];
        if (user.role_id === 2 && user.office_id) {
            const officeRes = await pool.query('SELECT entity_id FROM offices WHERE id = $1', [user.office_id]);
            const entityId = officeRes.rows[0]?.entity_id;
            if (entityId) {
                const servicesRes = await pool.query(`
                    SELECT s.name FROM services s
                    JOIN entity_services es ON es.service_id = s.id
                    WHERE es.entity_id = $1
                `, [entityId]);
                entityServices = servicesRes.rows.map(r => r.name);
            }
        }

        res.status(200).json({ status: 'success', data: { user: { ...user, entity_services: entityServices }, token } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const query = `
            SELECT u.*,
                   o.name as office_name, o.entity_id, e.name as entity_name, e.sigle as entity_sigle
            FROM users u
            LEFT JOIN offices o ON u.office_id = o.id
            LEFT JOIN entities e ON o.entity_id = e.id
            WHERE u.id = $1
        `;
        const result = await pool.query(query, [req.user.id]);
        const user = result.rows[0];

        if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });

        // Fetch entity services if user is an admin
        let entityServices = [];
        if (user.role_id === 2 && user.entity_id) {
            const servicesRes = await pool.query(`
                SELECT s.name FROM services s
                JOIN entity_services es ON es.service_id = s.id
                WHERE es.entity_id = $1
            `, [user.entity_id]);
            entityServices = servicesRes.rows.map(r => r.name);
        }

        res.status(200).json({ status: 'success', data: { ...user, entity_services: entityServices } });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const updateProfile = async (req, res) => {
    const { 
        first_name, last_name, sexe, dob, pob, 
        nationality, cin, marital_status, blood_group,
        city, department, country, full_address, address,
        phone, phone2, photo, nif
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
                address = COALESCE($14, address),
                phone = COALESCE($15, phone),
                phone2 = COALESCE($16, phone2),
                photo = COALESCE($17, photo),
                nif = COALESCE($18, nif)
            WHERE id = $19 RETURNING *
        `;
        
        const params = [
            first_name, last_name, sexe, dob, pob, 
            nationality, cin, marital_status, blood_group,
            city, department, country, full_address, address,
            phone, phone2, photo, nif,
            req.user.id
        ];

        const result = await pool.query(sql, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({ status: 'success', data: result.rows[0], message: 'Profil mis à jour' });
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { register, login, getProfile, updateProfile };
