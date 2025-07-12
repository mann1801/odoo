const express = require('express');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const userController = require('../controllers/userController');

const router = express.Router();

// Public: Get user profile by username
router.get('/:username', userController.getUserProfile);

// Admin: Get all users
router.get('/', protect, requireAdmin, userController.getUsers);

// Admin: Ban/unban user
router.put('/:id/ban', protect, requireAdmin, userController.toggleUserBan);

// Admin: Change user role
router.put('/:id/role', protect, requireAdmin, userController.changeUserRole);

// Admin: Delete user
router.delete('/:id', protect, requireAdmin, userController.deleteUser);

// Private: Get user stats
router.get('/:id/stats', protect, userController.getUserStats);

module.exports = router;
