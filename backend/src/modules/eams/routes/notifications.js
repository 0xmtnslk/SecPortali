const express = require('express');
const router = express.Router();
const notificationController = require('../../../controllers/notificationController');
const { auth } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all notifications for current user
router.get('/', notificationController.getNotifications);

// Get unread notifications
router.get('/unread', notificationController.getUnreadNotifications);

// Get notification by ID
router.get('/:id', notificationController.getNotificationById);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Get notification settings
router.get('/settings/my', notificationController.getNotificationSettings);

// Update notification settings
router.put('/settings/my', notificationController.updateNotificationSettings);

module.exports = router;
