const { models, sequelize} = require('../db'); // Importa os modelos do banco de dados

const uploadScheduleVersion = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum ficheiro foi enviado. Por favor, selecione um ficheiro CSV.');
    }

    try {
        const fileContent = req.file.buffer.toString('utf-8');
        const binaryFile = req.file.buffer; // Obtem o binário
        const description = req.body.description || 'Sem descrição';
        
        // Create a new schedule version
        const newVersion = await models.ScheduleVersion.create({
            description: description,
            isCurrent: false,
            status: 'pending',
            binaryFile: binaryFile, // Grava o binário
        });


        res.send(`Versão de horários criada com ID ${newVersion.id}`);
    } catch (err) {
        console.error('Erro ao carregar a versão de horários:', err);
        res.status(500).send('Erro ao carregar a versão de horários.');
    }
};

module.exports = { uploadScheduleVersion };
