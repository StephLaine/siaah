const express = require('express');
const router = express.Router();
const { getUserRequests, createRequest, getRequestById, getRequestByIdAdmin, getAllRequests, getOfficeRequests, getOffices, updateRequestStatus, updateRequest, deleteRequest, payRequest, searchRequests, getServices, sendUserMessage } = require('../controllers/request.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All request routes require authentication
router.use(authMiddleware);

// Messaging
router.post('/message', roleMiddleware([1, 2, 3]), sendUserMessage);

// User and General Routes
router.get('/', getUserRequests);
router.get('/offices', getOffices);
router.get('/services', getServices);

// Admin/Employee Routes
router.get('/search', roleMiddleware([1, 2, 3]), searchRequests);          // Recherche globale
router.get('/admin', roleMiddleware([1, 2]), getAllRequests);
router.get('/office-requests', roleMiddleware([1, 2, 3]), getOfficeRequests);
router.get('/admin/:id', roleMiddleware([1, 2, 3]), getRequestByIdAdmin);

// Request Actions
router.post('/', upload.any(), createRequest);
router.get('/:id', getRequestById);
router.put('/:id', upload.any(), updateRequest);
router.patch('/:id/status', roleMiddleware([1, 2, 3]), updateRequestStatus);
router.delete('/:id', deleteRequest);
router.post('/:id/pay', payRequest);

module.exports = router;
