const path = require('path');
const QRCode = require('qrcode');
const { models } = require('../db');

// Gera o QR Code para uma sala específica
exports.generateQrCodeImage = async (req, res) => {
    try {
        const classRoomId = req.params.classRoomId;
        const classRoom = await models.ClassRoom.findByPk(classRoomId);

        if (!classRoom) {
            return res.status(404).json({ success: false, message: "Sala não encontrada." });
        }

        // Conteúdo do QR Code (ID ou nome da sala)
        const qrContent = `sala_${classRoom.id}`; // Use o ID da sala ou qualquer valor único

        // Caminho do arquivo para salvar o QR Code
        const qrCodePath = path.join(__dirname, '..', 'qrcodes', `classroom_${classRoom.id}.png`);

        // Gerar QR Code com o conteúdo
        await QRCode.toFile(qrCodePath, qrContent);

        res.sendFile(qrCodePath); // Envia o arquivo gerado
        //res.status(200).json({ success: true, message: "QR Code gerado com sucesso.", qrCodePath });
    } catch (error) {
        console.error("Erro ao gerar QR Code:", error);
        res.status(500).json({ success: false, message: "Erro ao gerar QR Code." });
    }
};
