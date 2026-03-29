const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/userController');
const { auth, authorize } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all users (Admin, Manager, Hospital Manager, Central Manager)
router.get('/', auth, userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create user
router.post('/', authorize('Admin', 'Sistem Yöneticisi', 'Sistem Admini', 'Manager', 'Hospital Manager', 'Hastane Müdürü', 'Central Manager', 'Merkez Yöneticisi'), userController.createUser);

// Update user
router.put('/:id', authorize('Admin', 'Sistem Yöneticisi', 'Sistem Admini', 'Manager', 'Hospital Manager', 'Hastane Müdürü', 'Central Manager', 'Merkez Yöneticisi'), userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', authorize('Admin', 'Sistem Admini'), userController.deleteUser);

// Assign role to user
router.post('/:id/roles', authorize('Admin', 'Sistem Admini', 'Hospital Manager', 'Hastane Müdürü', 'Central Manager', 'Merkez Yöneticisi'), userController.assignRole);

// Remove role from user
router.delete('/:id/roles/:roleId', authorize('Admin', 'Sistem Admini', 'Hospital Manager', 'Hastane Müdürü', 'Central Manager', 'Merkez Yöneticisi'), userController.removeRole);

// Sync users from Oracle
router.post('/sync/oracle', authorize('Admin'), userController.syncFromOracle);

module.exports = router;
