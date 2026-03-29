const express = require('express');
const router = express.Router();
const areaController = require('../../../controllers/areaController');
const { auth, authorize, checkFacilityAccess } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// Area Types
router.get('/types', areaController.getAllAreaTypes);
router.get('/types/:id', areaController.getAreaTypeById);
router.post('/types', authorize('Admin', 'Central Manager', 'Hospital Manager'), areaController.createAreaType);
router.put('/types/:id', authorize('Admin', 'Central Manager', 'Hospital Manager'), areaController.updateAreaType);
router.delete('/types/:id', authorize('Admin', 'Central Manager'), areaController.deleteAreaType);

// Areas
router.get('/', areaController.getAllAreas);
router.get('/:id', areaController.getAreaById);
router.post('/', authorize('Admin', 'Central Manager', 'Hospital Manager', 'Manager'), areaController.createArea);
router.put('/:id', authorize('Admin', 'Central Manager', 'Hospital Manager', 'Manager'), areaController.updateArea);
router.delete('/:id', authorize('Admin', 'Central Manager', 'Hospital Manager'), areaController.deleteArea);

// Get areas by facility
router.get('/facility/:facilityId', areaController.getAreasByFacility);

// Get areas by block
router.get('/block/:blockId', areaController.getAreasByBlock);

// Get areas by type
router.get('/type/:typeId', areaController.getAreasByType);

module.exports = router;
