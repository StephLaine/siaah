const express = require('express');
const router = express.Router();
const c = require('../controllers/admin.controller');
const { authMiddleware, isSuperAdmin } = require('../middleware/auth.middleware');

/**
 * SUPER ADMIN ROUTES — /api/superadmin
 * ══════════════════════════════════════════════════
 * Accessible UNIQUEMENT par role_id = 1 (Super Admin MEF)
 * ══════════════════════════════════════════════════
 */

router.use(authMiddleware);
router.use(isSuperAdmin);

// Dashboard global
router.get('/stats', c.getStats);

// Gestion complète des entités
router.get('/entities',              c.getEntities);
router.post('/entities',             c.createEntity);
router.put('/entities/:id',          c.updateEntity);
router.delete('/entities/:id',       c.deleteEntity);
router.get('/entities/:id/services', c.getEntityServices);
router.put('/entities/:id/services', c.setEntityServices);

// Gestion complète des bureaux
router.get('/offices',        c.getOffices);
router.post('/offices',       c.createOffice);
router.put('/offices/:id',    c.updateOffice);
router.delete('/offices/:id', c.deleteOffice);

// Gestion complète des services
router.get('/services',        c.getServices);
router.post('/services',       c.createService);
router.put('/services/:id',    c.updateService);
router.delete('/services/:id', c.deleteService);

// Gestion complète des utilisateurs
router.get('/users',          c.getUsers);
router.get('/roles',          c.getRoles);
router.post('/users',         c.createUser);
router.put('/users/:id',      c.updateUser);
router.delete('/users/:id',   c.deleteUser);

// ── Gestion des Demandes (Super Admin SEULEMENT) ──
router.get('/requests',              c.getAllRequests);
router.delete('/requests/all',       c.deleteAllRequests);
router.delete('/requests/:id',       c.deleteRequest);
router.delete('/requests/user/:uid', c.deleteUserRequests);
router.patch('/requests/:id/block',  c.toggleBlockRequest);

module.exports = router;

