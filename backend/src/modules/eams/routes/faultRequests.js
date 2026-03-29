const express = require('express');
const router = express.Router();
const faultRequestController = require('../../../controllers/faultRequestController');
const { auth, authorize, checkFacilityAccess } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all fault requests
router.get('/', faultRequestController.getAllFaultRequests);

// Get fault request by ID
router.get('/:id', faultRequestController.getFaultRequestById);

// Create fault request
router.post('/', faultRequestController.createFaultRequest);

// Update fault request
router.put('/:id', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), faultRequestController.updateFaultRequest);

// Delete fault request
router.delete('/:id', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager'), faultRequestController.deleteFaultRequest);

// Assign fault request
router.post('/:id/assign', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), faultRequestController.assignFaultRequest);

// Complete fault request
router.post('/:id/complete', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'), faultRequestController.completeFaultRequest);

// Cancel fault request
router.post('/:id/cancel', authorize('Admin', 'Manager', 'Hospital Manager', 'Central Manager'), faultRequestController.cancelFaultRequest);

// Get fault requests by facility
router.get('/facility/:facilityId', faultRequestController.getFaultRequestsByFacility);

// Get fault requests by asset
router.get('/asset/:assetId', faultRequestController.getFaultRequestsByAsset);

// Get fault requests by user
router.get('/user/:userId', faultRequestController.getFaultRequestsByUser);

// Get fault requests by status
router.get('/status/:status', faultRequestController.getFaultRequestsByStatus);

// Add comment to fault request
router.post('/:id/comments', faultRequestController.addComment);

// Get fault request comments
router.get('/:id/comments', faultRequestController.getComments);

// Get fault request statistics
router.get('/statistics/dashboard', faultRequestController.getFaultRequestStatistics);

module.exports = router;
