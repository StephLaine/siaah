const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/license.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// --- Reference Data Routes ---
router.get('/refs/categories', licenseController.getCategories);

// --- Admin CRUD Routes ---
router.post('/admin/categories', authMiddleware, roleMiddleware([1]), licenseController.createCategory);
router.put('/admin/categories/:id', authMiddleware, roleMiddleware([1]), licenseController.updateCategory);
router.delete('/admin/categories/:id', authMiddleware, roleMiddleware([1]), licenseController.deleteCategory);

module.exports = router;
