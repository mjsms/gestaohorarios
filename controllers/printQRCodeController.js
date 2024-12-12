
const path = require('path');
const QRCode = require('qrcode');
const { models } = require('../db');
const qrCodeDir = path.join(__dirname, '..', 'qrcodes');
const fs = require('fs');


// Gera o QR Code para uma sala específica
exports.generateQrCodeImage = async (req, res) => {
    try {
        const classRoomId = req.params.classRoomId;
        const qrCodeDir = path.join(__dirname, '..', 'qrcodes');

        if (!classRoomId) {
            return res.status(404).json({ success: false, message: "Sala não encontrada." });
        }

        // Conteúdo do QR Code (ID ou nome da sala)
        const qrContent = `sala_${classRoomId}`; // Use o ID da sala ou qualquer valor único

        // Caminho do arquivo para salvar o QR Code
        const qrCodePath = path.join(qrCodeDir, `classroom_${classRoomId}.png`);

        if (!fs.existsSync(qrCodeDir)) {             
            fs.mkdirSync(qrCodeDir, { recursive: true });         
        }
        // Gerar QR Code com o conteúdo
        await QRCode.toFile(qrCodePath, qrContent);

        res.sendFile(qrCodePath); // Envia o arquivo gerado
        //res.status(200).json({ success: true, message: "QR Code gerado com sucesso.", qrCodePath });
    } catch (error) {
        console.error("Erro ao gerar QR Code:", error);
        res.status(500).json({ success: false, message: "Erro ao gerar QR Code." });
    }
};