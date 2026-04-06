const express = require('express');
const router = express.Router();
const c = require('../controllers/admin.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

/**
 * ADMIN ROUTES
 * ══════════════════════════════════════════════════
 * Accessible par :
 *   role_id = 1 → Super Admin (accès total)
 *   role_id = 2 → Admin Entité (accès à son entité)
 *   role_id = 3 → Employé (accès lecture seule aux stats)
 * ══════════════════════════════════════════════════
 */

// Toutes les routes admin requièrent une authentification
router.use(authMiddleware);

// Seuls les rôles 1, 2, 3 peuvent accéder à l'interface admin
router.use(roleMiddleware([1, 2, 3]));

// Dashboard stats — accessible au staff (1, 2, 3)
router.get('/stats', c.getStats);

// ─── Entités ─────────────────────────────────────────────────────────────────
// Lecture : rôles 1, 2, 3
router.get('/entities',              c.getEntities);
router.get('/entities/:id/services', c.getEntityServices);

// Modification : rôles 1, 2 seulement (les employés ne peuvent pas modifier)
router.post('/entities',             roleMiddleware([1, 2]), c.createEntity);
router.put('/entities/:id',          roleMiddleware([1, 2]), c.updateEntity);
router.delete('/entities/:id',       roleMiddleware([1]),    c.deleteEntity);  // SuperAdmin uniquement
router.put('/entities/:id/services', roleMiddleware([1, 2]), c.setEntityServices);

// ─── Bureaux ─────────────────────────────────────────────────────────────────
router.get('/offices',         c.getOffices);
router.post('/offices',        roleMiddleware([1, 2]), c.createOffice);
router.put('/offices/:id',     roleMiddleware([1, 2]), c.updateOffice);
router.delete('/offices/:id',  roleMiddleware([1]),    c.deleteOffice);  // SuperAdmin uniquement

// ─── Services ────────────────────────────────────────────────────────────────
router.get('/services',         c.getServices);
router.post('/services',        roleMiddleware([1]),    c.createService);   // SuperAdmin uniquement
router.put('/services/:id',     roleMiddleware([1]),    c.updateService);   // SuperAdmin uniquement
router.delete('/services/:id',  roleMiddleware([1]),    c.deleteService);   // SuperAdmin uniquement
// ─── Service Operations ──────────────────────────────────────────────────────
router.post('/operations',    roleMiddleware([1]), c.createOperation);
router.put('/operations/:id', roleMiddleware([1]), c.updateOperation);
router.delete('/operations/:id', roleMiddleware([1]), c.deleteOperation);

// ─── Utilisateurs ────────────────────────────────────────────────────────────
router.get('/users',              roleMiddleware([1, 2]), c.getUsers);
router.get('/users/:id',          roleMiddleware([1, 2, 3]), c.getUserDetail);
router.get('/users/:id/comms',    roleMiddleware([1, 2, 3]), c.getUserCommunications);
router.get('/roles',              roleMiddleware([1, 2]), c.getRoles);
router.post('/users',             roleMiddleware([1, 2]), c.createUser);
router.put('/users/:id',          roleMiddleware([1, 2]), c.updateUser);
router.put('/users/:id/profile',  roleMiddleware([1, 2, 3]), c.updateUserProfile);  // Permet maj infos personnelles + notes
router.put('/users/:id/avatar',   roleMiddleware([1, 2, 3]), upload.single('avatar'), c.updateUserAvatar);   // Permet la maj de l'avatar
router.delete('/users/:id',       roleMiddleware([1]),    c.deleteUser);     // SuperAdmin uniquement
router.get('/search', roleMiddleware([1, 2, 3]), c.globalSearch);

module.exports = router;
