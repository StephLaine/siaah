const { pool } = require('../config/db');

// ─── Assign a driving permit to a user (from a service request) ──────────────
const assignPermit = async (req, res) => {
    const { permit_number, issuance_date, duration_years, user_id, request_id } = req.body;

    if (!permit_number || !issuance_date || !duration_years || !user_id) {
        return res.status(400).json({
            status: 'error',
            message: 'Champs obligatoires : permit_number, issuance_date, duration_years, user_id'
        });
    }

    const years = parseInt(duration_years);
    if (isNaN(years) || years < 1) {
        return res.status(400).json({ status: 'error', message: 'duration_years doit être un entier >= 1' });
    }

    // Compute expiry date
    const issDate = new Date(issuance_date);
    const expDate = new Date(issDate);
    expDate.setFullYear(expDate.getFullYear() + years);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert the permit
        const permitRes = await client.query(
            `INSERT INTO driving_permits (permit_number, issuance_date, expiry_date)
             VALUES ($1, $2, $3)
             ON CONFLICT (permit_number) DO UPDATE
               SET issuance_date = EXCLUDED.issuance_date,
                   expiry_date   = EXCLUDED.expiry_date,
                   updated_at    = CURRENT_TIMESTAMP
             RETURNING *`,
            [permit_number.trim().toUpperCase(), issDate.toISOString().split('T')[0], expDate.toISOString().split('T')[0]]
        );
        const permit = permitRes.rows[0];

        // Link to user
        const linkRes = await client.query(
            `INSERT INTO user_permits (user_id, permit_id, request_id, status)
             VALUES ($1, $2, $3, 'assigned')
             ON CONFLICT (user_id, permit_id) DO UPDATE SET status = 'assigned', assigned_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [user_id, permit.id, request_id || null]
        );

        // If request_id provided, update service request details with category/type if supplied
        if (request_id) {
            // Expect optional fields in body
            const { licenseCategory, licenseType } = req.body;
            if (licenseCategory || licenseType) {
                // Build JSON fragment to merge into existing details
                const detailsUpdate = {};
                if (licenseCategory) detailsUpdate.licenseCategory = licenseCategory;
                if (licenseType) detailsUpdate.licenseType = licenseType;
                await client.query(
                    `UPDATE service_requests
                     SET details = COALESCE(details, '{}'::jsonb) || $1::jsonb,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $2`,
                    [JSON.stringify(detailsUpdate), request_id]
                );
            }
            await client.query(
                `UPDATE service_requests SET status = 'to_deliver', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [request_id]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            status: 'success',
            message: 'Permis assigné avec succès',
            data: {
                permit,
                link: linkRes.rows[0]
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('assignPermit error:', err);
        if (err.code === '23505') {
            return res.status(409).json({ status: 'error', message: `Le numéro de permis "${permit_number}" est déjà utilisé.` });
        }
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        client.release();
    }
};

// ─── List all permits assigned to a user ─────────────────────────────────────
const getUserPermits = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT
                up.id            AS link_id,
                up.status,
                up.assigned_at,
                up.request_id,
                dp.id            AS permit_id,
                dp.permit_number,
                dp.issuance_date,
                dp.expiry_date,
                dp.created_at,
                sr.details       AS request_details
             FROM user_permits up
             JOIN driving_permits dp ON dp.id = up.permit_id
             LEFT JOIN service_requests sr ON sr.id = up.request_id
             WHERE up.user_id = $1
             ORDER BY up.assigned_at DESC`,
            [id]
        );
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error('getUserPermits error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ─── Get one permit by its number (search) ───────────────────────────────────
const getPermitByNumber = async (req, res) => {
    const { number } = req.params;
    try {
        const result = await pool.query(
            `SELECT dp.*, up.user_id, up.status AS link_status, up.assigned_at,
                    u.first_name, u.last_name, u.email, u.phone, u.nif,
                    sr.details AS request_details
             FROM driving_permits dp
             LEFT JOIN user_permits up ON up.permit_id = dp.id
             LEFT JOIN users u ON u.id = up.user_id
             LEFT JOIN service_requests sr ON sr.id = up.request_id
             WHERE dp.permit_number = $1`,
            [number.trim().toUpperCase()]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Ce numéro de permis n\'existe pas.' });
        }
        
        const permit = result.rows[0];
        
        // Enforce ownership check for regular users (role 8)
        if (req.user.role_id === 8 && permit.user_id !== req.user.id) {
            return res.status(403).json({ status: 'error', message: 'Ce numéro de permis ne vous appartient pas.' });
        }
        
        res.json({ status: 'success', data: permit });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ─── List all permits (admin view) ───────────────────────────────────────────
const getAllPermits = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT dp.*, up.user_id, up.status AS link_status, up.assigned_at,
                    u.first_name, u.last_name, u.email
             FROM driving_permits dp
             LEFT JOIN user_permits up ON up.permit_id = dp.id
             LEFT JOIN users u ON u.id = up.user_id
             ORDER BY dp.created_at DESC`
        );
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ─── Revoke a permit link ─────────────────────────────────────────────────────
const revokePermit = async (req, res) => {
    const { linkId } = req.params;
    try {
        const result = await pool.query(
            `UPDATE user_permits SET status = 'revoked' WHERE id = $1 RETURNING *`,
            [linkId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Lien de permis introuvable' });
        }
        res.json({ status: 'success', message: 'Permis révoqué', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { assignPermit, getUserPermits, getPermitByNumber, getAllPermits, revokePermit };
