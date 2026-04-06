const express = require('express');
const router = express.Router();
const { createAppointment, getUserAppointments, getOfficeAppointments, updateAppointmentStatus, getPublicOffices } = require('../controllers/appointment.controller');
const { authMiddleware, roleMiddleware, lazyAuthMiddleware } = require('../middleware/auth.middleware');

// Public (can be anonymous or authenticated)
router.get('/offices', getPublicOffices); // Public office list
router.post('/', lazyAuthMiddleware, createAppointment); // Booking

// User Private
router.get('/mine', authMiddleware, getUserAppointments);

// Admin / Employee
router.get('/office', authMiddleware, roleMiddleware([1, 2, 3]), getOfficeAppointments);
router.patch('/:id/status', authMiddleware, roleMiddleware([1, 2, 3]), updateAppointmentStatus);

module.exports = router;
