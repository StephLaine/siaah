const db = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM license_categories ORDER BY code ASC');
        return res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.createCategory = async (req, res) => {
    const { code, name, description } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO license_categories (code, name, description) VALUES ($1, $2, $3) RETURNING *',
            [code, name, description]
        );
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { code, name, description } = req.body;
    try {
        const result = await db.query(
            'UPDATE license_categories SET code = $1, name = $2, description = $3 WHERE id = $4 RETURNING *',
            [code, name, description, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Category not found' });
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM license_categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Category not found' });
        res.status(200).json({ status: 'success', message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
