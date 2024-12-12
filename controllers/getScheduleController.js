const { models, sequelize} = require('../db');

const getScheduleByClassId = async (req, res) => {
    const { classGroupId } = req.params;
    const query = `
        SELECT 
            s.id, 
            s.date, 
            s."startTime", 
            s."endTime", 
            cr."name" AS "classRoomName", 
            sub."name" AS "subjectName"
        FROM "Schedule" s
        LEFT JOIN "ClassRoom" cr ON s."classRoomId" = cr.id
        LEFT JOIN "Shift" sh ON s."shiftId" = sh.id
        LEFT JOIN "Subject" sub ON sh."subjectId" = sub.id
        WHERE sh."classGroupId" = :classGroupId
        AND s."versionId" = (
            SELECT MAX(sv.id)
            FROM "ScheduleVersion" sv
        )
        AND s.date >= CURRENT_DATE
        ORDER BY s.date ASC, s."startTime" ASC;
    `;

    try {
        const schedules = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { classGroupId },
        });

        if (!schedules || schedules.length === 0) {
            console.warn(`Nenhum horário encontrado para o grupo de classe: ${classGroupId}`);
            return res.status(404).json({ success: false, message: 'Horários não encontrados para o grupo de classe fornecido.' });
        }

        res.json({
            success: true,
            schedules: schedules.map(schedule => ({
                id: schedule.id,
                date: schedule.date.toISOString().split('T')[0], // Formata a data como YYYY-MM-DD
                startTime: schedule.startTime.substring(0, 5), // Formata como HH:mm
                endTime: schedule.endTime.substring(0, 5), // Formata como HH:mm
                classRoom: schedule.classRoomName || 'Sala não disponível',
                subject: schedule.subjectName || 'Matéria não disponível',
            })),
        });
    } catch (error) {
        console.error('Erro ao buscar horários:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar horários.' });
    }
};

module.exports = { getScheduleByClassId };