const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// --- User Routes ---
router.get('/my', vehicleController.getMyVehicles);
router.get('/search', vehicleController.searchVehicles);
router.get('/:id', vehicleController.getVehicleById);

// --- Reference Data Routes (Public/Auth) ---
router.get('/refs/makes', vehicleController.getMakes);
router.get('/refs/models', vehicleController.getModels);
router.get('/refs/colors', vehicleController.getColors);

// --- Admin & Employee Routes (Role 1: SuperAdmin, Role 2: Admin, Role 3: Employee) ---
router.get('/admin/stats', roleMiddleware([1, 2, 3]), vehicleController.getVehicleStats);
router.get('/admin/all', roleMiddleware([1, 2, 3]), vehicleController.getAllVehicles);
router.post('/admin', roleMiddleware([1, 2, 3]), vehicleController.createVehicle);
router.put('/admin/:id', roleMiddleware([1, 2, 3]), vehicleController.updateVehicle);
router.delete('/admin/:id', roleMiddleware([1, 2, 3]), vehicleController.deleteVehicle);

// --- Admin: Makes & Models Management ---
router.post('/admin/makes', roleMiddleware([1, 2, 3]), vehicleController.createMake);
router.put('/admin/makes/:id', roleMiddleware([1, 2, 3]), vehicleController.updateMake);
router.delete('/admin/makes/:id', roleMiddleware([1, 2, 3]), vehicleController.deleteMake);

router.post('/admin/models', roleMiddleware([1, 2, 3]), vehicleController.createModel);
router.put('/admin/models/:id', roleMiddleware([1, 2, 3]), vehicleController.updateModel);
router.delete('/admin/models/:id', roleMiddleware([1, 2, 3]), vehicleController.deleteModel);

router.post('/admin/colors', roleMiddleware([1, 2, 3]), vehicleController.createColor);
router.put('/admin/colors/:id', roleMiddleware([1, 2, 3]), vehicleController.updateColor);
router.delete('/admin/colors/:id', roleMiddleware([1, 2, 3]), vehicleController.deleteColor);

module.exports = router;
