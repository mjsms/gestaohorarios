const { models, sequelize } = require('../db');

exports.markAttendance = async (req, res) => {
    const { studentId, classGroupId, classRoomId } = req.body;

    console.log('Dados recebidos:', req.body);

    if (!studentId || !classGroupId || !classRoomId) {
        return res.status(400).json({ success: false, message: "Dados incompletos." });
    }

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
          AND s.date = :currentDate
          AND s."startTime" <= :currentTime
          AND s."endTime" >= :currentTime
          AND cr.id = :classRoomId
        LIMIT 1;
    `;

    try {
        // Busca o horário correspondente
        const currentDate = new Date().toISOString().split('T')[0]; // Data atual
        const currentTime = new Date().toTimeString().split(' ')[0]; // Hora atual

        const schedule = await sequelize.query(query, {
            type: models.Sequelize.QueryTypes.SELECT,
            replacements: {
                classGroupId,
                currentDate,
                currentTime,
                classRoomId,
            },
        });

        if (schedule.length === 0) {
            return res.status(404).json({ success: false, message: "Nenhum horário correspondente encontrado para esta sala." });
        }

        // Marca a presença
        const [presence] = await models.ScheduleAttendance.findOrCreate({
            where: {
                scheduleId: schedule[0].id,
                studentId: studentId,
            },
            defaults: {
                attended: true,
            },
        });

        // Atualiza o valor de attended  se o registro já existir
        if (!presence.isNewRecord) {
            console.log('Atualizando registro existente:', presence);
            presence.attended = true;
            await presence.save();
        }

        return res.status(200).json({ success: true, message: "Presença marcada com sucesso!" });
    } catch (error) {
        console.error("Erro ao marcar presença:", error);
        return res.status(500).json({ success: false, message: "Erro ao marcar presença." });
    }
};
