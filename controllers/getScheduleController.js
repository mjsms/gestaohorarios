const { models, sequelize } = require('../db');

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
        LEFT JOIN "ScheduleVersion" sv ON s."versionId" = sv.id
        WHERE sh."classGroupId" = :classGroupId
        AND sv."isCurrent" = TRUE
        ORDER BY s.date ASC, s."startTime" ASC;
    `;

    try {
        const schedules = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { classGroupId },
        });

        // Verifica se não há horários encontrados
        if (!schedules || schedules.length === 0) {
            console.warn(`Nenhum horário encontrado para o grupo de classe: ${classGroupId}`);
            return res.status(404).json({
                success: false,
                message: 'Nenhum horário disponível para o grupo de classe fornecido.'
            });
        }

        // Retorna os horários encontrados
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
        // Trata erros na execução da query
        console.error('Erro ao buscar horários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar horários. Por favor, tente novamente mais tarde.'
        });
    }
};

module.exports = { getScheduleByClassId };
