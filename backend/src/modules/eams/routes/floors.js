const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../../../middleware/auth');
const floorController = require('../../../controllers/floorController');

// Uploads dizinini oluştur
const uploadsDir = path.join(__dirname, '../../uploads/dxf');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dxf-' + uniqueSuffix + '.dxf');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/dxf' || file.originalname.endsWith('.dxf')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece DXF dosyaları yüklenebilir'), false);
    }
  }
});

// Tüm floor route'ları için authentication gerekli
router.use(auth);

// Kat CRUD işlemleri
router.get('/facility/:facilityId', floorController.getFloorsByFacility);
router.get('/block/:blockId', floorController.getFloorsByBlock);
router.get('/:id', floorController.getFloorById);
router.post('/', floorController.createFloor);
router.put('/:id', floorController.updateFloor);
router.delete('/:id', floorController.deleteFloor);

// DXF dosya işlemleri
router.post('/:id/dxf', upload.single('dxfFile'), floorController.uploadDxf);
router.get('/:id/dxf', floorController.getDxfData);
router.delete('/:id/dxf', floorController.deleteDxf);

module.exports = router;