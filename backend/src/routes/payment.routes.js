const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Routes for payments
router.post('/initiate', authMiddleware, paymentController.initiatePayment);
router.post('/moncash-webhook', paymentController.handleMonCashWebhook); // Webhook usually doesn't have auth token
router.get('/verify/:paymentId', authMiddleware, paymentController.verifyPayment);

module.exports = router;
