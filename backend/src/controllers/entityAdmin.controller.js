const { pool } = require('../config/db');

// Helper to get entity_id from office_id
const getEntityId = async (officeId) => {
    if (!officeId) return null;
    const result = await pool.query('SELECT entity_id FROM offices WHERE id = $1', [officeId]);
    return result.rows[0]?.entity_id;
};

// ─── Statistics for the Entity ──────────────────────────────────────────────
const getEntityStats = async (req, res) => {
    try {
        const officeId = req.user.office_id;
        
        // If no office assigned (e.g. SuperAdmin), return empty stats safely
        if (!officeId) {
            return res.json({
                status: 'success',
                data: {
                    totalEmployees: 0,
                    stats: { total: 0, pending: 0, processing: 0, accepted: 0, rejected: 0, processed: 0 },
                    recentActivity: []
                }
            });
        }

        const [employees, reqCounts, recentActivity] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM users WHERE office_id = $1 AND role_id = 3', [officeId]),
            pool.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending,
                    COUNT(*) FILTER (WHERE status = 'processing') as processing,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed,
                    COUNT(*) FILTER (WHERE status = 'rejected') as rejected
                FROM service_requests
                WHERE office_id = $1
            `, [officeId]),

            pool.query(`
                SELECT sr.id, sr.type, sr.status, sr.updated_at, u.first_name, u.last_name, o.name as office_name
                FROM service_requests sr
                JOIN users u ON sr.user_id = u.id
                JOIN offices o ON sr.office_id = o.id
                WHERE sr.office_id = $1
                ORDER BY sr.updated_at DESC
                LIMIT 10
            `, [officeId])
        ]);

        res.json({
            status: 'success',
            data: {
                totalEmployees: parseInt(employees.rows[0].count),
                stats: {
                    total: parseInt(reqCounts.rows[0].total),
                    pending: parseInt(reqCounts.rows[0].pending),
                    processing: parseInt(reqCounts.rows[0].processing),
                    accepted: parseInt(reqCounts.rows[0].completed),
                    rejected: parseInt(reqCounts.rows[0].rejected),
                    processed: parseInt(reqCounts.rows[0].completed) + parseInt(reqCounts.rows[0].rejected)
                },
                recentActivity: recentActivity.rows
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ─── Employees Management ───────────────────────────────────────────────────
const getEmployees = async (req, res) => {
    try {
        const entityId = await getEntityId(req.user.office_id);
        if (!entityId) return res.status(403).json({ status: 'error', message: 'Entité non trouvée' });

        const result = await pool.query(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role_id, u.assigned_services, u.job_title,
                   o.name as office_name, u.office_id
            FROM users u
            JOIN offices o ON u.office_id = o.id
            WHERE o.entity_id = $1 AND u.role_id = 3
            ORDER BY u.created_at DESC
        `, [entityId]);

        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const createEmployee = async (req, res) => {
    const { first_name, last_name, email, password, phone, office_id, assigned_services = [], job_title = '' } = req.body;
    
    try {
        const adminEntityId = await getEntityId(req.user.office_id);
        const targetOfficeEntityId = await getEntityId(office_id);

        if (adminEntityId !== targetOfficeEntityId) {
            return res.status(403).json({ status: 'error', message: "Vous ne pouvez ajouter un employé que dans un bureau de votre entité." });
        }

        const result = await pool.query(`
            INSERT INTO users (first_name, last_name, email, password, phone, role_id, office_id, assigned_services, job_title)
            VALUES ($1, $2, $3, $4, $5, 3, $6, $7, $8)
            RETURNING id, first_name, last_name, email, office_id, assigned_services, job_title
        `, [first_name, last_name, email, password, phone, office_id, JSON.stringify(assigned_services), job_title]);

        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ─── Offices for the Entity ──────────────────────────────────────────────────
const getEntityOffices = async (req, res) => {
    try {
        const entityId = await getEntityId(req.user.office_id);
        const result = await pool.query('SELECT id, name FROM offices WHERE entity_id = $1', [entityId]);
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = {
    getEntityStats,
    getEmployees,
    createEmployee,
    getEntityOffices
};
