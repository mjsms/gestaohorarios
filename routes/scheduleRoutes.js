const express = require('express');
const router = express.Router();
const { models , sequelize} = require('../db');
const { Op } = require('sequelize');
const multer = require('multer');
const { uploadScheduleVersion } = require('../controllers/scheduleController');
const { getScheduleByClassId } = require('../controllers/getScheduleController');// Import the controller function
const e = require('connect-flash');

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });


router.get('/compare-versions', async (req, res) => {
    const { ids } = req.query;
    const versionIds = ids.split(',').map(Number);

    if (versionIds.length < 2 || versionIds.length > 3) {
        return res.status(400).send('Selecione entre 2 e 3 versões.');
    }

    const data = await sequelize.query(`
        SELECT 
            v.id AS version_id, 
            v.description AS version_description, 
            COUNT(q.id) AS quality_issues_count, 
            q."issueType"
        FROM "ScheduleVersion" v
        JOIN "Schedule" s ON s."versionId" = v.id
        LEFT JOIN "QualityIssue" q ON q."scheduleId" = s.id
        WHERE v.id in(:ids)
        GROUP BY v.id, v.description, q."issueType"
        ORDER BY v.id, q."issueType";
    `, {
        replacements: { ids: versionIds }, // versionIds é um array de números
        type: sequelize.QueryTypes.SELECT
    });
    

    const groupedData = {};
    data.forEach(row => {
        if (!groupedData[row.version_id]) {
            groupedData[row.version_id] = { description: row.version_description, data: {} };
        }
        groupedData[row.version_id].data[row.issueType] = row.quality_issues_count || 0;
    });

    res.render('layout', { content:'compare', groupedData });
});
// Fetch all schedule versions
router.get('/json', async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;

        const offset = (page - 1) * pageSize;
        const { count, rows } = await models.ScheduleVersion.findAndCountAll({
            attributes: { exclude: ['binaryFile'] }, // Exclude binaryFile from the results
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

router.get('/:versionId/json', async (req, res) => {
    const { versionId } = req.params;
    const { page = 1, pageSize = 10, sorters, filter } = req.query;
    
    const offset = (page - 1) * pageSize;
    const parsedSorters = sorters ? JSON.parse(sorters) : [];
    const sortField = parsedSorters[0]?.field || null;
    const sortDirection = parsedSorters[0]?.dir?.toUpperCase() || "ASC";
    filterQualityIssues = false
    // Process filters
    try{
        if (filter) {
            filter.forEach((f) => {
                if (f.field === "hasQualityIssues") {
                    filterQualityIssues = f.value === "true" 
                }
            });
        }
    }catch(error){
        console.log(error);
    }
    // Consulta para contar o total de registros
    const countQuery = `
        SELECT COUNT(*) AS total_count
        FROM (
            SELECT s.id
            FROM "Schedule" s
            LEFT JOIN "QualityIssue" q ON q."scheduleId" = s.id
            WHERE s."versionId" = :versionId
            GROUP BY s.id
            HAVING (:filterQualityIssues = FALSE OR COUNT(q.id) > 0)
        ) AS filtered_schedules;
    `;
    
    // Consulta para buscar registros com paginação
        const dataQuery = `
            SELECT 
                s.id,
                s.date,
                s."startTime",
                s."endTime",
                sh.name as "shiftName",
                c.name as "classRoomName",
                STRING_AGG(q."issueType", ', ') AS "QualityIssues"
            FROM "Schedule" s
            LEFT JOIN "Shift" sh on sh.id = s."shiftId"
            LEFT JOIN "ClassRoom" c on c.id = s."classRoomId"
            LEFT JOIN "QualityIssue" q ON q."scheduleId" = s.id
            WHERE s."versionId" = :versionId
            GROUP BY s.id, s.date, s."startTime", s."endTime",sh.name,c.name
            HAVING (:filterQualityIssues = FALSE OR COUNT(q.id) > 0)
            LIMIT :pageSize OFFSET :offset;
    `;
    
    const replacements = {
        versionId,
        filterQualityIssues: filterQualityIssues === true ? "true" : null,
        sortField,
        sortDirection,
        pageSize: parseInt(pageSize, 10),
        offset,
    };
    
    try {
        // Executar a consulta de contagem
        const [countResults] = await sequelize.query(countQuery, { replacements });
        const total = parseInt(countResults[0].total_count, 10);
    
        // Executar a consulta de dados
        const [dataResults] = await sequelize.query(dataQuery, { replacements });
    
        res.json({
            data: dataResults,
            last_page: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Erro ao buscar horários com paginação:', error);
        res.status(500).send('Erro ao buscar horários.');
    }
    
});


// Fetch details for a specific schedule version
router.get('/:id', async (req, res) => {
    const scheduleVersionId = req.params.id;

    try {
        const scheduleVersion = await models.ScheduleVersion.findByPk(scheduleVersionId);

        if (!scheduleVersion) {
            return res.status(404).render('error', { message: "Versão de horário não encontrada." });
        }
        // Calcular os números dos Quality Issues
        const query = `
            select  
            COUNT(1) AS total,
            SUM(CASE WHEN q."issueType" = 'sobrelotação' THEN 1 ELSE 0 END) AS overcrowded,
            SUM(CASE WHEN q."issueType" = 'desadequado' THEN 1 ELSE 0 END) AS unsuitableRooms,
            SUM(CASE WHEN q."issueType" = 'horário indesejado' THEN 1 ELSE 0 END) AS earlyMorningSaturdays
            from "Schedule" s
            left join "QualityIssue" q on s.id = q."scheduleId"
            where 
                s."versionId" = :scheduleVersionId
        `;

        const qualityIssues = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { scheduleVersionId }, 
        });

        res.render('layout', { content:"scheduleDetails", scheduleVersion, qualityIssues });
    } catch (error) {
        console.error('Erro ao buscar detalhes da versão de horário:', error);
        res.status(500).render('error', { message: 'Erro ao buscar detalhes da versão de horário.' });
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

// Rota para buscar horários por turma (classGroupId)
router.get('/classGroup/:classGroupId', getScheduleByClassId);

module.exports = router;