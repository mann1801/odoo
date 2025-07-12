const express = require('express');
const { protect } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Get user notifications
router.get('/', protect, notificationController.getNotifications);
// Mark notification as read
router.put('/:id/read', protect, notificationController.markAsRead);
// Mark all as read
router.put('/read-all', protect, notificationController.markAllAsRead);
// Get unread count
router.get('/unread-count', protect, notificationController.getUnreadCount);
// Delete notification
router.delete('/:id', protect, notificationController.deleteNotification);
// Delete all notifications
router.delete('/', protect, notificationController.deleteAllNotifications);

module.exports = router;
