const express = require('express');
const router = express.Router();
const { models , sequelize} = require('../db');

router.post('/', async (req, res) => {
    const { scheduleId, userId, isAttending } = req.body;

    try {
        const [attendance, created] = await models.ScheduleAttendance.findOrCreate({
            where: { scheduleId, userId },
            defaults: { isAttending },
        });

        if (!created) {
            attendance.isAttending = isAttending;
            await attendance.save();
        }

        res.status(200).json({ success: true, message: 'Presença atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar presença:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar presença.' });
    }
});

module.exports = router;
