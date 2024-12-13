const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');
const printQRCodeController = require('../controllers/printQRCodeController');

// Endpoint para mostrar QR code da sala
router.get('/:classRoomId', printQRCodeController.generateQrCodeImage);

router.get('/classroom/:id', scannerController.getClassroomName);

module.exports = router;
