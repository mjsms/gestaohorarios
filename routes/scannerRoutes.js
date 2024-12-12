const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');

// Endpoint para gerar QR Codes
router.post('/generate-qr-codes', scannerController.generateQrCodesForClassrooms);

// Endpoint para buscar QR Codes das salas
router.get('/classrooms-with-qr', scannerController.getClassroomsWithQrCodes);

router.post('/validateQrCode', scannerController.validateQrCode);

module.exports = router;
