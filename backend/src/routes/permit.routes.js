const express = require('express');
const router = express.Router();
const c = require('../controllers/permit.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// All permit routes require authentication
router.use(authMiddleware);

// ─── Admin / Staff only ───────────────────────────────────────────────────────
// Assign a permit to a user (roles: SuperAdmin, Admin, Employee, Agent Permis)
router.post('/assign', roleMiddleware([1, 2, 3, 6]), c.assignPermit);

// List all permits (admin view)
router.get('/', roleMiddleware([1, 2, 3, 6]), c.getAllPermits);

// Search a permit by its number
router.get('/search/:number', roleMiddleware([1, 2, 3, 6]), c.getPermitByNumber);

// Revoke a permit link
router.patch('/revoke/:linkId', roleMiddleware([1, 2]), c.revokePermit);

// ─── Per-user permit history (staff or the user themselves) ──────────────────
router.get('/user/:id', roleMiddleware([1, 2, 3, 6, 8]), c.getUserPermits);

module.exports = router;
