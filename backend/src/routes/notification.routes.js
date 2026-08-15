const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, getMyCommunications } = require('../controllers/notification.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', getNotifications);
router.get('/comms', getMyCommunications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

module.exports = router;
