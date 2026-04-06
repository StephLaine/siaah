const { pool } = require('../config/db');

// Create appointment (public / authenticated)
const createAppointment = async (req, res) => {
    const {
        service, service_type, appointment_date, appointment_time,
        first_name, last_name, email, phone, nif, notes, office_id
    } = req.body;
    
    // Support either authenticated user or anonymous with manual info
    const user_id = req.user ? req.user.id : null;

    try {
        const result = await pool.query(`
            INSERT INTO appointments
              (user_id, service, service_type, appointment_date, appointment_time,
               first_name, last_name, email, phone, nif, notes, office_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [user_id, service, service_type, appointment_date, appointment_time,
            first_name, last_name, email, phone, nif, notes, office_id || null]);

        // If authenticated user account exists, backfill their profile too
        if (user_id) {
            const updates = [];
            const vals = [];
            let idx = 1;
            if (phone) { updates.push(`phone = COALESCE(phone, $${idx++})`); vals.push(phone); }
            if (nif)   { updates.push(`nif   = COALESCE(nif,   $${idx++})`); vals.push(nif); }
            if (updates.length > 0) {
                vals.push(user_id);
                await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`, vals);
            }
        }

        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        console.error('Appointment create error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Get appointments for logged-in user
const getUserAppointments = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await pool.query(
            `SELECT a.*, o.name as office_name, o.address as office_address
             FROM appointments a
             LEFT JOIN offices o ON a.office_id = o.id
             WHERE a.user_id = $1 
             ORDER BY a.appointment_date DESC`,
            [user_id]
        );
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Admin/Employee: get appointments for their office/services
const getOfficeAppointments = async (req, res) => {
    const { service, user_id } = req.query;
    try {
        let query = `
            SELECT a.*, u.first_name as user_first, u.last_name as user_last, u.email as user_email,
                   o.name as office_name, o.address as office_address
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN offices o ON a.office_id = o.id
            WHERE 1=1
        `;
        const params = [];
        let pIdx = 1;
        if (service) {
            query += ` AND a.service ILIKE $${pIdx++}`;
            params.push(`%${service}%`);
        }
        if (user_id) {
            query += ` AND a.user_id = $${pIdx++}`;
            params.push(user_id);
        }
        query += ` ORDER BY a.appointment_date ASC, a.appointment_time ASC`;
        const result = await pool.query(query, params);
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Admin: update appointment status
const updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Rendez-vous non trouvé' });
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Public: get all offices
const getPublicOffices = async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, name, address FROM offices ORDER BY name ASC`);
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { 
    createAppointment, 
    getUserAppointments, 
    getOfficeAppointments, 
    updateAppointmentStatus,
    getPublicOffices 
};
