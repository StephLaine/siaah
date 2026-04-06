const express = require('express');
const router = express.Router();
const controller = require('../controllers/entityAdmin.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// Base protection
router.use(authMiddleware);

router.get('/stats', roleMiddleware([1, 2, 3]), controller.getEntityStats);
router.get('/employees', roleMiddleware([1, 2]), controller.getEmployees);
router.post('/employees', roleMiddleware([1, 2]), controller.createEmployee);
router.get('/offices', roleMiddleware([1, 2, 3]), controller.getEntityOffices);

module.exports = router;
