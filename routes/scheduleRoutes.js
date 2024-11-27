const express = require('express');
const router = express.Router();
const { models } = require('../db');
const multer = require('multer');
const { uploadScheduleVersion } = require('../controllers/scheduleController'); // Import the controller function

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });


// Fetch all schedule versions
router.get('/json', async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;

        const offset = (page - 1) * pageSize;
        const { count, rows } = await models.ScheduleVersion.findAndCountAll({
            offset,
            limit: parseInt(pageSize, 10),
            order: [['createdAt', 'DESC']],
        });

        res.json({
            data: rows,
            last_page: Math.ceil(count / pageSize),
        });
    } catch (err) {
        console.error('Erro ao buscar versões de horários:', err);
        res.status(500).send('Erro ao buscar versões de horários.');
    }
});

// Route to handle schedule version upload
router.post('/upload', upload.single('file'), uploadScheduleVersion);


// Fetch details for a specific schedule version
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const scheduleVersion = await models.ScheduleVersion.findByPk(id, {
            include: [models.Schedule], // Include schedules linked to this version
        });

        if (!scheduleVersion) {
            return res.status(404).send('Versão de horários não encontrada.');
        }

        res.render('layout', { content:'scheduleDetails', scheduleVersion });
    } catch (err) {
        console.error('Erro ao buscar detalhes da versão de horários:', err);
        res.status(500).send('Erro ao buscar detalhes da versão de horários.');
    }
});

// Fetch all schedule versions
router.get('/', async (req, res) => {
    try {
        res.render('layout', { content:'schedules' });
    } catch (err) {
        console.error('Erro ao buscar versões de horários:', err);
        res.status(500).send('Erro ao buscar versões de horários.');
    }
});



module.exports = router;