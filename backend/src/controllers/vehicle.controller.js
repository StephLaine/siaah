const { pool } = require('../config/db');

// --- User Methods ---

// Get all vehicles for the logged-in user
const getMyVehicles = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM vehicles WHERE owner_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error('Error fetching user vehicles:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Get a single vehicle for the user
const getVehicleById = async (req, res) => {
    const { id } = req.params;
    try {
        // Simple search for the current user
        const result = await pool.query(
            'SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2',
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Véhicule non trouvé' });
        }
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        console.error('Error fetching vehicle:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// --- Admin Methods ---

// Get global stats for all vehicles
const getVehicleStats = async (req, res) => {
    try {
        // Total count
        const totalResult = await pool.query('SELECT COUNT(*) FROM vehicles');
        // Group by type
        const typeResult = await pool.query(`
            SELECT vehicle_type, COUNT(*) as count 
            FROM vehicles 
            GROUP BY vehicle_type
        `);
        
        res.status(200).json({ 
            status: 'success', 
            data: {
                total: parseInt(totalResult.rows[0].count),
                byType: typeResult.rows
            }
        });
    } catch (err) {
        console.error('Error fetching vehicle stats:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Get all vehicles for admin (with optional limit)
const getAllVehicles = async (req, res) => {
    const { limit, offset } = req.query;
    try {
        let query = `
            SELECT v.*, u.first_name, u.last_name, u.nif, u.email, u.phone, u.address as owner_address, u.city as owner_city
            FROM vehicles v
            LEFT JOIN users u ON v.owner_id = u.id
            ORDER BY v.created_at DESC
        `;
        const params = [];
        let pIdx = 1;

        if (limit) {
            query += ` LIMIT $${pIdx++}`;
            params.push(limit);
        }
        if (offset) {
            query += ` OFFSET $${pIdx++}`;
            params.push(offset);
        }

        const result = await pool.query(query, params);
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error('Error fetching all vehicles:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// CRUD: Create (Enhanced with NIF support)
const createVehicle = async (req, res) => {
    const { owner_id, owner_nif, vin, license_plate, make, model, year, color, engine_number, seats_count, fuel_type, vehicle_type, photo_url } = req.body;
    try {
        let final_owner_id = owner_id;

        // If NIF is provided, find the owner_id
        if (owner_nif) {
            const userRes = await pool.query('SELECT id FROM users WHERE nif = $1', [owner_nif]);
            if (userRes.rows.length === 0) {
                return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé avec ce NIF' });
            }
            final_owner_id = userRes.rows[0].id;
        }

        if (!final_owner_id) {
            return res.status(400).json({ status: 'error', message: 'ID Propriétaire ou NIF requis' });
        }

        const result = await pool.query(
            `INSERT INTO vehicles 
            (owner_id, vin, license_plate, make, model, year, color, engine_number, seats_count, fuel_type, vehicle_type, photo_url, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING *`,
            [final_owner_id, vin, license_plate, make, model, year, color, engine_number, seats_count, fuel_type, vehicle_type, photo_url, 'active']
        );
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        console.error('Error creating vehicle:', err);
        if (err.code === '23505') { // Unique constraint violation
            return res.status(400).json({ status: 'error', message: 'La plaque d\'immatriculation existe déjà.' });
        }
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// CRUD: Update
const updateVehicle = async (req, res) => {
    const { id } = req.params;
    const { owner_nif, vin, license_plate, make, model, year, color, engine_number, seats_count, fuel_type, vehicle_type, photo_url, status } = req.body;
    try {
        let owner_id = null;
        if (owner_nif) {
            const userRes = await pool.query('SELECT id FROM users WHERE nif = $1', [owner_nif]);
            if (userRes.rows.length > 0) owner_id = userRes.rows[0].id;
        }

        const result = await pool.query(
            `UPDATE vehicles 
             SET vin=COALESCE($1, vin), license_plate=COALESCE($2, license_plate), make=COALESCE($3, make), 
                 model=COALESCE($4, model), year=COALESCE($5, year), color=COALESCE($6, color), 
                 engine_number=COALESCE($7, engine_number), seats_count=COALESCE($8, seats_count), 
                 fuel_type=COALESCE($9, fuel_type), vehicle_type=COALESCE($10, vehicle_type), 
                 photo_url=COALESCE($11, photo_url), status=COALESCE($12, status),
                 owner_id=COALESCE($13, owner_id)
             WHERE id = $14 RETURNING *`,
            [vin, license_plate, make, model, year, color, engine_number, seats_count, fuel_type, vehicle_type, photo_url, status, owner_id, id]
        );
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        console.error('Error updating vehicle:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// CRUD: Delete
const deleteVehicle = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
        res.status(200).json({ status: 'success', message: 'Véhicule supprimé' });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const searchVehicles = async (req, res) => {
    const { q } = req.query;
    try {
        const query = (req.user.role_id <= 3) 
            ? `SELECT * FROM vehicles WHERE (LOWER(vin) LIKE LOWER($1) OR LOWER(license_plate) LIKE LOWER($1))`
            : `SELECT * FROM vehicles WHERE (LOWER(vin) LIKE LOWER($1) OR LOWER(license_plate) LIKE LOWER($1)) AND owner_id = $2`;
        
        const params = (req.user.role_id <= 3) ? [`%${q}%`] : [`%${q}%`, req.user.id];
        
        const result = await pool.query(query, params);
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error('Error searching vehicles:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// --- Reference Data Methods ---

const getMakes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vehicle_makes ORDER BY name ASC');
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const getModels = async (req, res) => {
    const { make_id } = req.query;
    try {
        const query = make_id ? 'SELECT * FROM vehicle_models WHERE make_id = $1 ORDER BY name ASC' : 'SELECT * FROM vehicle_models ORDER BY name ASC';
        const result = await pool.query(query, make_id ? [make_id] : []);
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const getColors = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vehicle_colors ORDER BY name ASC');
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

// Admin CRUD for Reference Data
const createMake = async (req, res) => {
    const { name } = req.body;
    try {
        const result = await pool.query('INSERT INTO vehicle_makes (name) VALUES ($1) RETURNING *', [name]);
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const updateMake = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await pool.query('UPDATE vehicle_makes SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const deleteMake = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM vehicle_makes WHERE id = $1', [id]);
        res.json({ status: 'success', message: 'Marque supprimée' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const createModel = async (req, res) => {
    const { make_id, name } = req.body;
    try {
        const result = await pool.query('INSERT INTO vehicle_models (make_id, name) VALUES ($1, $2) RETURNING *', [make_id, name]);
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const updateModel = async (req, res) => {
    const { id } = req.params;
    const { make_id, name } = req.body;
    try {
        const result = await pool.query('UPDATE vehicle_models SET make_id = $1, name = $2 WHERE id = $3 RETURNING *', [make_id, name, id]);
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const deleteModel = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM vehicle_models WHERE id = $1', [id]);
        res.json({ status: 'success', message: 'Modèle supprimé' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const createColor = async (req, res) => {
    const { name, hex_code } = req.body;
    try {
        const result = await pool.query('INSERT INTO vehicle_colors (name, hex_code) VALUES ($1, $2) RETURNING *', [name, hex_code]);
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const updateColor = async (req, res) => {
    const { id } = req.params;
    const { name, hex_code } = req.body;
    try {
        const result = await pool.query('UPDATE vehicle_colors SET name = $1, hex_code = $2 WHERE id = $3 RETURNING *', [name, hex_code, id]);
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const deleteColor = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM vehicle_colors WHERE id = $1', [id]);
        res.json({ status: 'success', message: 'Couleur supprimée' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

module.exports = {
    getMyVehicles,
    getVehicleById,
    getVehicleStats,
    getAllVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    searchVehicles,
    getMakes,
    getModels,
    getColors,
    createMake,
    updateMake,
    deleteMake,
    createModel,
    updateModel,
    deleteModel,
    createColor,
    updateColor,
    deleteColor
};
