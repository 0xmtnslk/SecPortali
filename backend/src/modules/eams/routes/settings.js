const express = require('express');
const router = express.Router();
const settingsController = require('../../../controllers/settingsController');
const { auth, authorize } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// System Settings (Admin, Central Manager only)
router.get('/system', authorize('Admin', 'Sistem Admini', 'Central Manager', 'Merkez Yöneticisi'), settingsController.getSystemSettings);
router.put('/system/:key', authorize('Admin', 'Sistem Admini', 'Central Manager', 'Merkez Yöneticisi'), settingsController.updateSystemSetting);
router.post('/system', authorize('Admin', 'Sistem Admini', 'Central Manager', 'Merkez Yöneticisi'), settingsController.createSystemSetting);

// Equipment Categories (Multi-level hierarchy)
router.get('/equipment-categories', settingsController.getEquipmentCategories);
router.post('/equipment-categories', authorize('Admin', 'Central Manager', 'Hospital Manager', 'Manager', 'Administrative Responsible', 'Technical Responsible'), settingsController.createEquipmentCategory);
router.put('/equipment-categories/:id', authorize('Admin', 'Central Manager', 'Hospital Manager', 'Manager', 'Administrative Responsible', 'Technical Responsible'), settingsController.updateEquipmentCategory);
router.delete('/equipment-categories/:id', authorize('Admin', 'Central Manager', 'Hospital Manager', 'Manager', 'Administrative Responsible', 'Technical Responsible'), settingsController.deleteEquipmentCategory);

// Asset Categories
router.get('/categories', settingsController.getAssetCategories);
router.get('/categories/:id', settingsController.getAssetCategoryById);
router.post('/categories', authorize('Admin', 'Central Manager'), settingsController.createAssetCategory);
router.put('/categories/:id', authorize('Admin', 'Central Manager'), settingsController.updateAssetCategory);
router.delete('/categories/:id', authorize('Admin', 'Central Manager'), settingsController.deleteAssetCategory);

// Measurement Units
router.get('/measurement-units', settingsController.getMeasurementUnits);
router.get('/measurement-units/:id', settingsController.getMeasurementUnitById);
router.post('/measurement-units', authorize('Admin', 'Central Manager'), settingsController.createMeasurementUnit);
router.put('/measurement-units/:id', authorize('Admin', 'Central Manager'), settingsController.updateMeasurementUnit);
router.delete('/measurement-units/:id', authorize('Admin', 'Central Manager'), settingsController.deleteMeasurementUnit);

// Energy Types
router.get('/energy-types', settingsController.getEnergyTypes);
router.get('/energy-types/:id', settingsController.getEnergyTypeById);
router.post('/energy-types', authorize('Admin', 'Central Manager'), settingsController.createEnergyType);
router.put('/energy-types/:id', authorize('Admin', 'Central Manager'), settingsController.updateEnergyType);
router.delete('/energy-types/:id', authorize('Admin', 'Central Manager'), settingsController.deleteEnergyType);

// Authorized Departments
router.get('/departments', settingsController.getAuthorizedDepartments);
router.get('/departments/:id', settingsController.getAuthorizedDepartmentById);
router.post('/departments', authorize('Admin', 'Central Manager'), settingsController.createAuthorizedDepartment);
router.put('/departments/:id', authorize('Admin', 'Central Manager'), settingsController.updateAuthorizedDepartment);
router.delete('/departments/:id', authorize('Admin', 'Central Manager'), settingsController.deleteAuthorizedDepartment);

// Maintenance Types
router.get('/maintenance-types', settingsController.getMaintenanceTypes);
router.get('/maintenance-types/:id', settingsController.getMaintenanceTypeById);
router.post('/maintenance-types', authorize('Admin', 'Central Manager'), settingsController.createMaintenanceType);
router.put('/maintenance-types/:id', authorize('Admin', 'Central Manager'), settingsController.updateMaintenanceType);
router.delete('/maintenance-types/:id', authorize('Admin', 'Central Manager'), settingsController.deleteMaintenanceType);

// Equipment Hierarchy (4-level tree structure)
router.get('/equipment-hierarchy', settingsController.getEquipmentHierarchy);
router.get('/equipment-hierarchy/:id', settingsController.getEquipmentHierarchyById);
router.post('/equipment-hierarchy', authorize('Admin', 'Central Manager', 'Hospital Manager', 'Manager', 'Administrative Responsible', 'Technical Responsible'), settingsController.createEquipmentHierarchy);
router.put('/equipment-hierarchy/:id', authorize('Admin', 'Central Manager', 'Hospital Manager', 'Manager', 'Administrative Responsible', 'Technical Responsible'), settingsController.updateEquipmentHierarchy);
router.delete('/equipment-hierarchy/:id', authorize('Admin', 'Central Manager', 'Hospital Manager', 'Manager', 'Administrative Responsible', 'Technical Responsible'), settingsController.deleteEquipmentHierarchy);
router.patch('/equipment-hierarchy/:id/move', authorize('Admin', 'Central Manager', 'Hospital Manager', 'Manager', 'Administrative Responsible', 'Technical Responsible'), settingsController.moveEquipmentHierarchy);

module.exports = router;
