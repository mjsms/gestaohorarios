const multer = require('multer');

// Configuração para armazenar o arquivo em memória
const upload = multer({ storage: multer.memoryStorage() });

const express = require('express');
const { uploadClassRooms } = require('../controllers/classRoomController');
const { models, sequelize } = require('../db'); 

const router = express.Router();

// Rota para upload de salas
router.post('/upload/', upload.single('file'), uploadClassRooms);

router.get('/', async (req, res) => {
    try {
        // Buscar as salas com a contagem de características associadas e ordenação por ID
        const classRooms = await models.ClassRoom.findAll({
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
            order: [['id', 'ASC']], // Ordenar por ID em ordem ascendente (use 'DESC' para descendente)
        });

        // Renderizar a página com a lista de salas
        res.render('layout', { content: 'rooms', classRooms });
    } catch (err) {
        console.error('Erro ao buscar as salas:', err);
        res.status(500).send('Erro ao buscar as salas.');
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


module.exports = router;
