const { pool } = require('../config/db');
const { sendRequestConfirmation, sendStatusUpdateEmail, sendCustomMessageEmail } = require('../utils/email.service');
const { createNotification } = require('./notification.controller');

// Helper to sync user profile from request details
const syncUserInfo = async (userId, details) => {
    try {
        const { sexe, dob, pob, nationality, bloodGroup, state, city, country, address, street, houseNumber, phone, phone2, nifCin } = details;
        let full_address = address;
        if (!full_address && street) full_address = `${houseNumber ? houseNumber + ' ' : ''}${street}`.trim();
        let nif = null, cin = null;
        if (nifCin) { if (nifCin.length > 10) cin = nifCin; else nif = nifCin; }

        const updates = [];
        const values = [];
        let paramIdx = 1;

        if (sexe) { updates.push(`sexe = COALESCE(sexe, $${paramIdx++})`); values.push(sexe.substring(0, 20)); }
        if (dob) { updates.push(`dob = COALESCE(dob, $${paramIdx++})`); values.push(dob); }
        if (pob) { updates.push(`pob = COALESCE(pob, $${paramIdx++})`); values.push(pob); }
        if (nationality) { updates.push(`nationality = COALESCE(nationality, $${paramIdx++})`); values.push(nationality); }
        if (bloodGroup) { updates.push(`blood_group = COALESCE(blood_group, $${paramIdx++})`); values.push(bloodGroup); }
        if (city) { updates.push(`city = COALESCE(city, $${paramIdx++})`); values.push(city); }
        if (state) { updates.push(`department = COALESCE(department, $${paramIdx++})`); values.push(state); }
        if (country) { updates.push(`country = COALESCE(country, $${paramIdx++})`); values.push(country); }
        if (full_address) { updates.push(`full_address = COALESCE(full_address, $${paramIdx++})`); values.push(full_address); }
        if (phone) { updates.push(`phone = COALESCE(phone, $${paramIdx++})`); values.push(phone); }
        if (phone2) { updates.push(`phone2 = COALESCE(phone2, $${paramIdx++})`); values.push(phone2); }
        if (cin) { updates.push(`cin = COALESCE(cin, $${paramIdx++})`); values.push(cin); }
        if (nif) { updates.push(`nif = COALESCE(nif, $${paramIdx++})`); values.push(nif); }

        if (updates.length > 0) {
            values.push(userId);
            await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx}`, values);
        }
    } catch (err) {
        console.error('Error syncing user info:', err);
    }
};

// Get all requests for a user
const getUserRequests = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM service_requests WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error('Error fetching user requests:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Create a new service request
const createRequest = async (req, res) => {
    let { type, details, status, price, office_id } = req.body;
    try {
        if (typeof details === 'string') details = JSON.parse(details);

        // Handle files if uploaded via multipart
        if (req.files && req.files.length > 0) {
            if (!details.submittedDocuments) details.submittedDocuments = [];
            req.files.forEach(file => {
                const fieldName = file.fieldname;
                const docIdx = details.submittedDocuments.findIndex(d => d.field === fieldName || d.name === fieldName);
                if (docIdx > -1) {
                    details.submittedDocuments[docIdx].path = file.filename;
                } else {
                    details.submittedDocuments.push({
                        name: fieldName,
                        path: file.filename,
                        fileName: file.originalname,
                        field: fieldName
                    });
                }
            });
        }

        const finalStatus = status || 'pending';
        const finalOfficeId = (office_id && office_id !== 'null' && office_id !== 'undefined' && office_id !== '' && !isNaN(parseInt(office_id))) ? parseInt(office_id) : null;
        const finalPrice = (price && price !== 'null' && price !== 'undefined' && !isNaN(parseFloat(price))) ? parseFloat(price) : 0;

        // Sync user profile from registration/request data
        await syncUserInfo(req.user.id, details);

        const result = await pool.query(
            'INSERT INTO service_requests (user_id, type, details, status, price, office_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, type, details, finalStatus, finalPrice, finalOfficeId]
        );

        // Send confirmation email and create notification
        pool.query('SELECT first_name, email FROM users WHERE id = $1', [req.user.id])
            .then(u => {
                if (u.rows[0]) {
                    sendRequestConfirmation(u.rows[0], result.rows[0]);
                    createNotification(
                        req.user.id,
                        'Demande reçue',
                        `Votre demande pour "${type}" a été enregistrée avec succès.`,
                        'success'
                    );
                }
            }).catch(e => console.error('Email confirmation/notification error:', e));

        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        console.error('Error creating request:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Get a single request
const getRequestById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT r.*, so.detailed_description, so.price_htg
            FROM service_requests r
            LEFT JOIN service_operations so ON (r.details->>'operationId')::int = so.id
            WHERE r.id = $1 AND r.user_id = $2`;
        const result = await pool.query(sql, [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Request not found' });
        }
        const row = result.rows[0];
        // Merge operation fields into details if missing
        if (row.detailed_description && (!row.details || !row.details.detailed_description)) {
            row.details = { ...(row.details || {}), detailed_description: row.detailed_description };
        }
        if (row.price_htg != null && (!row.details || row.details.price_htg == null)) {
            row.details = { ...(row.details || {}), price_htg: row.price_htg };
        }
        // Remove extra columns before sending
        const { detailed_description, price_htg, ...cleanRow } = row;
        res.status(200).json({ status: 'success', data: cleanRow });
    } catch (err) {
        console.error('Error fetching request:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Admin: Get a single request
const getRequestByIdAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT r.*,
                   o.name as office_name,
                   so.required_documents as operation_required_docs,
                   r.details->>'firstName' as first_name,
                   r.details->>'lastName' as last_name,
                   SPLIT_PART(r.type, ' - ', 1) as service_name
            FROM service_requests r
            LEFT JOIN offices o ON r.office_id = o.id
            LEFT JOIN service_operations so ON (r.details->>'operationId')::text = so.id::text
            WHERE r.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Demande non trouvée' });
        }
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        console.error('Error fetching request by id (admin):', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Admin: Get all requests across the system
const getAllRequests = async (req, res) => {
    try {
        const query = `
            SELECT r.*,
                   o.name as office_name,
                   so.required_documents as operation_required_docs,
                   r.details->>'firstName' as first_name,
                   r.details->>'lastName' as last_name,
                   SPLIT_PART(r.type, ' - ', 1) as service_name
            FROM service_requests r
            LEFT JOIN offices o ON r.office_id = o.id
            LEFT JOIN service_operations so ON (r.details->>'operationId')::text = so.id::text
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query);
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error('Error fetching all requests:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Admin: Get requests scoped to the admin's office
const getOfficeRequests = async (req, res) => {
    try {
        const officeId = req.user.office_id;
        if (!officeId) return res.status(403).json({ status: 'error', message: 'Accès refusé' });

        const query = `
            SELECT r.*,
                   o.name as office_name,
                   so.required_documents as operation_required_docs,
                   r.details->>'firstName' as first_name,
                   r.details->>'lastName' as last_name,
                   SPLIT_PART(r.type, ' - ', 1) as service_name
            FROM service_requests r
            LEFT JOIN offices o ON r.office_id = o.id
            LEFT JOIN service_operations so ON (r.details->>'operationId')::text = so.id::text
            WHERE r.office_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query, [officeId]);
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error('Error fetching office requests:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const getOffices = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, e.name as entity_name,
                ARRAY(SELECT service_id FROM entity_services WHERE entity_id = o.entity_id) as service_ids
            FROM offices o
            LEFT JOIN entities e ON o.entity_id = e.id
            ORDER BY o.name ASC
        `);
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Admin: Update request status
const updateRequestStatus = async (req, res) => {
    const id = parseInt(req.params.id);
    const { status, details, note } = req.body;
    try {
        let result;
        if (details) {
            const sql = 'UPDATE service_requests SET status = $1, details = $3::jsonb, updated_at = NOW() WHERE id = $2 RETURNING *';
            result = await pool.query(sql, [status, id, JSON.stringify(details)]);
        } else {
            const sql = 'UPDATE service_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
            result = await pool.query(sql, [status, id]);
        }

        if (result.rows.length > 0) {
            const updatedReq = result.rows[0];
            // Send update notification and email
            pool.query('SELECT id, first_name, email FROM users WHERE id = $1', [updatedReq.user_id])
                .then(u => {
                    if (u.rows[0]) {
                        sendStatusUpdateEmail(u.rows[0], updatedReq, note, req.user.id);
                        createNotification(
                            updatedReq.user_id,
                            'Mise à jour de votre dossier',
                            `Le statut de votre demande "${updatedReq.type}" est passé à : ${status}.`,
                            'info'
                        );
                    }
                }).catch(e => console.error('Status update email/notification error:', e));
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Demande non trouvée' });
        }
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const updateRequest = async (req, res) => {
    let { type, details, status } = req.body;
    const { id } = req.params;
    try {
        if (typeof details === 'string') details = JSON.parse(details);

        const result = await pool.query(
            'UPDATE service_requests SET type = $1, details = $2, status = COALESCE($3, status) WHERE id = $4 AND user_id = $5 RETURNING *',
            [type, details, status, id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Request not found' });
        }
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const deleteRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM service_requests WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Request not found' });
        }
        res.status(200).json({ status: 'success', message: 'Request deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const payRequest = async (req, res) => {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    try {
        const result = await pool.query(
            "UPDATE service_requests SET payment_status = 'paid', status = CASE WHEN status = 'validated' THEN 'to_deliver' ELSE 'processing' END, payment_method = $1, payment_date = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *",
            [paymentMethod || 'Inconnu', id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Request not found' });
        }
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const searchRequests = async (req, res) => {
    const { q } = req.query;
    try {
        const term = q.trim();
        const isNumeric = /^\d+$/.test(term);
        const result = await pool.query(
            `(SELECT sr.id, sr.type, sr.status, sr.created_at, sr.office_id, u.first_name, u.last_name, u.email, u.nif, o.name as office_name, 'request' as result_type
              FROM service_requests sr JOIN users u ON sr.user_id = u.id LEFT JOIN offices o ON sr.office_id = o.id
              WHERE ($1 AND sr.id = $2::int) OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER($3) OR LOWER(u.email) LIKE LOWER($3) OR u.nif LIKE $3)
             UNION ALL
             (SELECT u.id, 'Profil Usager' as type, 'active' as status, u.created_at, u.office_id, u.first_name, u.last_name, u.email, u.nif, o.name as office_name, 'user' as result_type
              FROM users u LEFT JOIN offices o ON u.office_id = o.id WHERE LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER($3) OR LOWER(u.email) LIKE LOWER($3) OR u.nif LIKE $3 AND u.role_id = 4)
              ORDER BY created_at DESC LIMIT 30`,
            [isNumeric, isNumeric ? parseInt(term) : 0, `%${term}%`]
        );
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const getServices = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.id, s.name, s.required_documents, s.is_public,
                   COALESCE((SELECT json_agg(op ORDER BY op.name) FROM service_operations op WHERE op.service_id = s.id AND op.actif = true), '[]') as operations
            FROM services s WHERE actif = true AND is_public = true ORDER BY name ASC
        `);
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const sendUserMessage = async (req, res) => {
    const { userId, subject, message } = req.body;
    try {
        const [targetResult, adminResult] = await Promise.all([
            pool.query('SELECT id, first_name, email FROM users WHERE id = $1', [userId]),
            pool.query('SELECT id, first_name, last_name FROM users WHERE id = $1', [req.user.id])
        ]);

        const targetUser = targetResult.rows[0];
        const adminUser = adminResult.rows[0];

        if (!targetUser) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });

        const authorName = adminUser ? `${adminUser.first_name} ${adminUser.last_name}` : 'Administrateur SIAAH';

        await sendCustomMessageEmail(targetUser, subject || 'Information SIAAH', message, authorName, req.user.id);
        res.json({ status: 'success', message: 'Message envoyé' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = {
    getUserRequests, createRequest, getRequestById, getRequestByIdAdmin, getAllRequests, getOfficeRequests, getOffices,
    updateRequestStatus, updateRequest, deleteRequest, payRequest, searchRequests, getServices, sendUserMessage
};
