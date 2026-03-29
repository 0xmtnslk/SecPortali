const express = require('express');
const router = express.Router();
const multer = require('multer');
const facilityController = require('../../../controllers/facilityController');
const { auth, authorize } = require('../../../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// All routes require authentication
router.use(auth);

// Get all facilities
router.get('/', facilityController.getAllFacilities);

// Get facility by ID
router.get('/:id', facilityController.getFacilityById);

// Create facility (Admin, Central Manager)
router.post('/', authorize('Admin', 'Central Manager'), facilityController.createFacility);

// Update facility (Admin, Central Manager, Hospital Manager)
router.put('/:id', authorize('Admin', 'Central Manager', 'Hospital Manager'), facilityController.updateFacility);

// Delete facility (Admin, Central Manager)
router.delete('/:id', authorize('Admin', 'Central Manager'), facilityController.deleteFacility);

// Get facility blocks
router.get('/:id/blocks', facilityController.getFacilityBlocks);

// Add block to facility
router.post('/:id/blocks', authorize('Admin', 'Central Manager', 'Hospital Manager'), facilityController.addBlock);

// Update block
router.put('/:id/blocks/:blockId', authorize('Admin', 'Central Manager', 'Hospital Manager'), facilityController.updateBlock);

// Delete block
router.delete('/:id/blocks/:blockId', authorize('Admin', 'Central Manager', 'Hospital Manager'), facilityController.deleteBlock);

// Import facilities from CSV (Admin, Central Manager)
router.post('/import', authorize('Admin', 'Central Manager'), upload.single('file'), facilityController.importFacilitiesFromCSV);

// Export facilities to CSV (Admin, Central Manager, Hospital Manager)
router.get('/export', authorize('Admin', 'Central Manager', 'Hospital Manager'), facilityController.exportFacilitiesToCSV);

module.exports = router;
