const QRCode = require('qrcode'); // Biblioteca para gerar QR Codes
const { models } = require('../db'); // Importa os modelos do banco de dados

exports.getClassroomName = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('input:', id);

        // Busca a sala pelo ID
        const classRoom = await models.ClassRoom.findByPk(id);

        if (!classRoom) {
            return res.status(404).json({
                success: false,
                message: 'Id inválido. Sala não encontrada.',
            });
        }

        // Retorna o nome da sala relacionado ao QR Code
        return res.status(200).json({
            success: true,
            message: 'Sala válida.',
            classRoom: {
                id: classRoom.id,
                name: classRoom.name,
            },
        });
    } catch (err) {
        console.error('Erro ao processar id da sala:', err);

        // Retorna uma resposta de erro genérica
        return res.status(500).json({
            success: false,
            message: 'Erro ao processar id da sala.',
        });
    }
};

