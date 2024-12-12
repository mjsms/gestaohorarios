const QRCode = require('qrcode'); // Biblioteca para gerar QR Codes
const { models } = require('../db'); // Importa os modelos do banco de dados

// Gera e associa QR Codes às salas
exports.generateQrCodesForClassrooms = async (req, res) => {
    try {
        // Busca todas as salas
        const classRooms = await models.ClassRoom.findAll();

        // Itera por todas as salas
        for (const room of classRooms) {
            // Define o conteúdo do QR Code (URL ou ID)
            const qrContent = `https://example.com/classrooms/${room.id}`;

            // Gera o QR Code em Base64
            const qrCode = await QRCode.toDataURL(qrContent);

            // Atualiza a sala com o QR Code gerado
            await room.update({ qrCode: qrCode });
        }

        res.status(200).json({ success: true, message: 'QR Codes gerados com sucesso.' });
    } catch (error) {
        console.error('Erro ao gerar QR Codes:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar QR Codes.' });
    }
};

// Busca todas as salas com QR Codes
exports.getClassroomsWithQrCodes = async (req, res) => {
    try {
        const classRooms = await models.ClassRoom.findAll({
            attributes: ['id', 'name', 'qrCode'], // Seleciona os campos necessários
        });

        res.status(200).json({ success: true, data: classRooms });
    } catch (error) {
        console.error('Erro ao buscar salas:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar salas.' });
    }
};

