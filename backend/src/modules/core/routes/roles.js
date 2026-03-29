const express = require('express');
const router = express.Router();
const roleController = require('../../../controllers/roleController');
const { auth, authorize } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all roles
router.get('/', roleController.getAllRoles);

// Get role by ID
router.get('/:id', roleController.getRoleById);

// Create role (Admin only)
router.post('/', authorize('Admin', 'Sistem Admini'), roleController.createRole);

// Update role (Admin only)
router.put('/:id', authorize('Admin', 'Sistem Admini'), roleController.updateRole);

// Delete role (Admin only)
router.delete('/:id', authorize('Admin', 'Sistem Admini'), roleController.deleteRole);

module.exports = router;
