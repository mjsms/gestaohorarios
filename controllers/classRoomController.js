const csv = require('csv-parser');
const { Readable } = require('stream');
const { models } = require('../db'); // Importa os modelos do banco de dados

const uploadClassRooms = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum ficheiro foi enviado. Por favor, selecione um ficheiro CSV.');
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const results = [];
    let csvHeaders = []; // Variável para armazenar os cabeçalhos

    try {
        // Converter o buffer em um stream para processar o CSV
        const stream = require('stream').Readable.from(fileContent);

        stream
            .pipe(csv({ separator: ';', mapHeaders: ({ header }) => header.trim() }))
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                if (results.length === 0) {
                    return res.status(400).send('Erro: ficheiro CSV está vazio.');
                }

                // Capturar os cabeçalhos diretamente da primeira linha
                csvHeaders = Object.keys(results[0]);
                const featuresStartIndex = csvHeaders.indexOf('Nº características') + 1;

                if (featuresStartIndex === 0) {
                    return res.status(400).send('Erro: coluna "Nº características" não encontrada no ficheiro CSV.');
                }

                for (const row of results) {
                    // Criar ou encontrar a sala (ClassRoom)
                    const [classRoom] = await models.ClassRoom.findOrCreate({
                        where: { name: row['Nome sala'] },
                        defaults: {
                            capacity: parseInt(row['Capacidade Normal'], 10) || null,
                        },
                    });

                    // Atualizar a capacidade se estiver diferente
                    const newCapacity = parseInt(row['Capacidade Normal'], 10) || null;
                    if (classRoom.capacity !== newCapacity) {
                        await classRoom.update({ capacity: newCapacity });
                    }

                    // Processar colunas que são características
                    const featureKeys = csvHeaders.slice(featuresStartIndex); // Seleciona colunas após "Nº características"
                    const currentFeatureIds = [];

                    for (const featureKey of featureKeys) {
                        const isFeaturePresent = row[featureKey]?.toUpperCase() === 'X';
                        if (isFeaturePresent) {
                            // Criar ou encontrar a característica
                            const [feature] = await models.Feature.findOrCreate({ where: { name: featureKey } });

                            // Adicionar ao relacionamento se ainda não existir
                            const [classRoomFeature] = await models.ClassRoomFeature.findOrCreate({
                                where: {
                                    featureId: feature.id,
                                    classRoomId: classRoom.id,
                                },
                            });

                            // Registrar o ID da feature processada
                            currentFeatureIds.push(feature.id);
                        }
                    }

                    // Remover características que não estão mais no CSV
                    const existingFeatures = await models.ClassRoomFeature.findAll({
                        where: { classRoomId: classRoom.id },
                    });

                    for (const existingFeature of existingFeatures) {
                        if (!currentFeatureIds.includes(existingFeature.featureId)) {
                            await existingFeature.destroy(); // Remover relações não presentes no CSV
                        }
                    }
                }

                res.send('Salas e características carregadas e atualizadas com sucesso!');
            });
    } catch (err) {
        console.error('Erro ao processar o CSV:', err);
        res.status(500).send('Erro ao processar o ficheiro.');
    }
};



module.exports = { uploadClassRooms };
