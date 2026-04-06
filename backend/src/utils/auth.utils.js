const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Generates a JWT token for a user.
 * @param {Object} user - The user object containing id and role.
 * @returns {string} - The JWT token.
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role_id: user.role_id, office_id: user.office_id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

module.exports = { generateToken };
