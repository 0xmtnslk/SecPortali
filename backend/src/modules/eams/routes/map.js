const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const mapController = require('../../../controllers/mapController');

// Tüm map route'ları için authentication gerekli
router.use(auth);

// Tesis harita durumu
router.get('/facility/:facilityId/status', mapController.getFacilityMapStatus);

// Kat harita verisi
router.get('/floor/:floorId', mapController.getFloorMapData);

// Mahal eşleştirme
router.put('/areas/:areaId/map', mapController.mapAreaToEntity);

// Varlık konumu güncelleme
router.put('/assets/:assetId/location', mapController.updateAssetLocation);

module.exports = router;