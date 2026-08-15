const { pool } = require('../config/db');

const getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        res.status(200).json({ status: 'success', message: 'Notification marquée comme lue' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
            [req.user.id]
        );
        res.status(200).json({ status: 'success', message: 'Toutes les notifications marquées comme lues' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Helper function for other controllers to create notifications
const createNotification = async (userId, title, message, type = 'info') => {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
            [userId, title, message, type]
        );
    } catch (err) {
        console.error('Failed to create notification:', err);
    }
};

const getMyCommunications = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM communications WHERE user_id = $1 ORDER BY sent_at DESC LIMIT 50',
            [req.user.id]
        );
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification, getMyCommunications };
