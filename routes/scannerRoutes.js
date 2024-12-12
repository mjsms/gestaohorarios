const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');
const printQRCodeController = require('../controllers/printQRCodeController');

// Endpoint para gerar QR Codes
router.post('/generate-qr-codes', scannerController.generateQrCodesForClassrooms);

// Endpoint para buscar QR Codes das salas
router.get('/classrooms-with-qr', scannerController.getClassroomsWithQrCodes);

// Endpoint para mostrar QR code da sala
router.get('/:classRoomId', printQRCodeController.generateQrCodeImage);

module.exports = router;
