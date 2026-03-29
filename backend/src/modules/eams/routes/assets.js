const express = require('express');
const router = express.Router();
const assetController = require('../../../controllers/assetController');
const { auth, authorize, checkFacilityAccess } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all assets
router.get('/', assetController.getAllAssets);

// Get form options for asset creation/editing
router.get('/form-options', assetController.getFormOptions);

// Get asset by ID
router.get('/:id', assetController.getAssetById);

// Create asset
router.post('/', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), assetController.createAsset);

// Update asset
router.put('/:id', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), assetController.updateAsset);

// Delete asset
router.delete('/:id', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager'), assetController.deleteAsset);

// Get assets by facility
router.get('/facility/:facilityId', assetController.getAssetsByFacility);

// Get assets by category
router.get('/category/:categoryId', assetController.getAssetsByCategory);

// Get assets by area
router.get('/area/:areaId', assetController.getAssetsByArea);

// Upload asset documents
router.post('/:id/documents', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), assetController.uploadDocuments);

// Get asset maintenance history
router.get('/:id/maintenance-history', assetController.getMaintenanceHistory);

// Get asset fault history
router.get('/:id/fault-history', assetController.getFaultHistory);

module.exports = router;
