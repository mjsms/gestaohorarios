const express = require('express');
const router = express.Router();
const { models , sequelize} = require('../db');
const presenceController = require('../controllers/presenceController');

router.post('/', async (req, res) => {
    const { scheduleId, userId:studentId, isAttending } = req.body;

    console.log('Dados recebidos:', req.body);

    if (!scheduleId || !studentId || isAttending === undefined) {
        return res.status(400).json({ success: false, message: 'Dados incompletos.' });
    }

    try {
        // Tenta encontrar ou criar um registro de presença
        const [attendance] = await models.ScheduleAttendance.findOrCreate({
            where: {
                scheduleId: scheduleId,
                studentId: studentId,
            },
            defaults: {
                isAttending: isAttending,
            },
        });

        // Atualiza o valor de isAttending se o registro já existir
        if (!attendance.isNewRecord) {
            console.log('Atualizando registro existente:', attendance);
            attendance.isAttending = isAttending;
            await attendance.save();
        }

        res.json({ success: true, message: 'Presença atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar presença:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar presença.' });
    }
});

router.post('/mark-presence', presenceController.markAttendance);

module.exports = router;
