const multer = require('multer');

// Configuração para armazenar o arquivo em memória
const upload = multer({ storage: multer.memoryStorage() });

const express = require('express');
const { uploadClassRooms } = require('../controllers/classRoomController');
const { models, sequelize } = require('../db'); 
const router = express.Router();
const { Op } = require('sequelize');

// Rota para upload de salas
router.post('/upload/', upload.single('file'), uploadClassRooms);

router.get('/', async (req, res) => {
    try {
        res.render('layout', { content: 'rooms' }); // Renderiza o arquivo classroom.ejs
    } catch (err) {
        console.error('Erro ao renderizar a página de salas:', err);
        res.status(500).send('Erro ao carregar a página.');
    }
});

router.get('/json', async (req, res) => {
    try {
        const { page = 1, pageSize = 10, filter = "" } = req.query;

        const offset = (page - 1) * pageSize;

        // Adiciona lógica de filtro (por nome)
        const whereCondition = filter
            ? { name: { [Op.iLike]: `%${filter}%` } } // Usa operador iLike para busca case-insensitive
            : {};

        const { count, rows } = await models.ClassRoom.findAndCountAll({
            where: whereCondition, // Filtra os dados
            attributes: [
                'id',
                'name',
                'capacity',
                [sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM "ClassRoomFeature" AS cf
                    WHERE cf."classRoomId" = "ClassRoom"."id"
                )`), 'featureCount'], // Subquery para contar as características
            ],
            offset,
            limit: parseInt(pageSize, 10),
            order: [['id', 'ASC']],
        });

        res.json({
            data: rows,
            last_page: Math.ceil(count / pageSize),
        });
    } catch (err) {
        console.error('Erro ao buscar salas:', err);
        res.status(500).send('Erro ao buscar salas.');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const classRoom = await models.ClassRoom.findByPk(id, {
            include: models.Feature, // Inclui características associadas
        });

        const allFeatures = await models.Feature.findAll(); // Busca todas as características disponíveis

        res.render('layout', { content: 'roomDetails', classRoom, allFeatures });
    } catch (err) {
        console.error('Erro ao buscar os detalhes da sala:', err);
        res.status(500).send('Erro ao buscar os detalhes da sala.');
    }
});

router.post('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, capacity, features } = req.body;

        // Atualizar nome e capacidade
        const classRoom = await models.ClassRoom.findByPk(id);
        if (!classRoom) {
            return res.status(404).send('Sala não encontrada.');
        }

        await classRoom.update({ name, capacity });

        // Atualizar características
        const featureIds = Array.isArray(features) ? features.map(id => parseInt(id, 10)) : [];
        await models.ClassRoomFeature.destroy({ where: { classRoomId: id } }); // Remove as antigas
        for (const featureId of featureIds) {
            await models.ClassRoomFeature.create({ classRoomId: id, featureId });
        }

        res.redirect(`/classroom`); // Redireciona para a página de detalhes
    } catch (err) {
        console.error('Erro ao atualizar a sala:', err);
        res.status(500).send('Erro ao atualizar a sala.');
    }
});

router.get('/qrcode/:id', async (req, res) => {
    try {
        const { id } = req.params;

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
});

module.exports = router;
