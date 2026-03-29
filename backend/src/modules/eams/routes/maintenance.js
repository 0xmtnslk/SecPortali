const express = require('express');
const router = express.Router();
const maintenanceController = require('../../../controllers/maintenanceController');
const { auth, authorize, checkFacilityAccess } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// Maintenance Plans
router.get('/plans', maintenanceController.getAllMaintenancePlans);
router.get('/plans/:id', maintenanceController.getMaintenancePlanById);
router.post('/plans', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), maintenanceController.createMaintenancePlan);
router.put('/plans/:id', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), maintenanceController.updateMaintenancePlan);
router.delete('/plans/:id', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager'), maintenanceController.deleteMaintenancePlan);

// Maintenance Records
router.get('/records', maintenanceController.getAllMaintenanceRecords);
router.get('/records/:id', maintenanceController.getMaintenanceRecordById);
router.post('/records', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), maintenanceController.createMaintenanceRecord);
router.put('/records/:id', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), maintenanceController.updateMaintenanceRecord);
router.delete('/records/:id', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager'), maintenanceController.deleteMaintenanceRecord);

// Get maintenance records by asset
router.get('/records/asset/:assetId', maintenanceController.getMaintenanceRecordsByAsset);

// Get upcoming maintenance
router.get('/upcoming', maintenanceController.getUpcomingMaintenance);

// Get overdue maintenance
router.get('/overdue', maintenanceController.getOverdueMaintenance);

// Complete maintenance record
router.post('/records/:id/complete', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), maintenanceController.completeMaintenance);

// Get maintenance statistics
router.get('/statistics', maintenanceController.getMaintenanceStatistics);

module.exports = router;
