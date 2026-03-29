const express = require('express');
const router = express.Router();
const contractorController = require('../../../controllers/contractorController');
const { auth, authorize } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all contractors
router.get('/', contractorController.getAllContractors);

// Get contractor by ID
router.get('/:id', contractorController.getContractorById);

// Create contractor (Admin, Central Manager, Hospital Manager)
router.post('/', authorize('Admin', 'Central Manager', 'Hospital Manager'), contractorController.createContractor);

// Update contractor (Admin, Central Manager, Hospital Manager)
router.put('/:id', authorize('Admin', 'Central Manager', 'Hospital Manager'), contractorController.updateContractor);

// Delete contractor (Admin, Central Manager)
router.delete('/:id', authorize('Admin', 'Central Manager'), contractorController.deleteContractor);

// Get contractor facilities
router.get('/:id/facilities', contractorController.getContractorFacilities);

// Assign contractor to facility
router.post('/:id/facilities/:facilityId', authorize('Admin', 'Central Manager', 'Hospital Manager'), contractorController.assignToFacility);

// Remove contractor from facility
router.delete('/:id/facilities/:facilityId', authorize('Admin', 'Central Manager', 'Hospital Manager'), contractorController.removeFromFacility);

// Get contractor employees
router.get('/:id/employees', contractorController.getContractorEmployees);

// Add contractor employee
router.post('/:id/employees', authorize('Admin', 'Central Manager', 'Hospital Manager'), contractorController.addEmployee);

// Update contractor employee
router.put('/:id/employees/:employeeId', authorize('Admin', 'Central Manager', 'Hospital Manager'), contractorController.updateEmployee);

// Delete contractor employee
router.delete('/:id/employees/:employeeId', authorize('Admin', 'Central Manager', 'Hospital Manager'), contractorController.deleteEmployee);

// Get contractor statistics
router.get('/:id/statistics', contractorController.getContractorStatistics);

module.exports = router;
