const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const db = require('./models'); // Caminho para os modelos

(async () => {
    try {
        await db.sequelize.sync({ force: true }); // `force: true` recria a bd
        console.log('Database synced successfully.');
    } catch (err) {
        console.error('Error syncing database:', err);
    }
})();

// Definir o motor de templates como EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Variáveis globais para armazenar dados carregados
let horarios = [];
let salas = [];



// Função para garantir que os diretórios existem
function garantirDiretorios() {
    const roomsDir = path.join(__dirname, 'uploads', 'rooms');
    const schedulesDir = path.join(__dirname, 'uploads', 'schedules');

    // Criar as pastas caso elas não existam
    if (!fs.existsSync(roomsDir)) {
        fs.mkdirSync(roomsDir, { recursive: true });
    }
    if (!fs.existsSync(schedulesDir)) {
        fs.mkdirSync(schedulesDir, { recursive: true });
    }
}

// Função para carregar ficheiros CSV das pastas uploads/rooms e uploads/schedules
function carregarFicheiros() {
    const roomsDir = path.join(__dirname, 'uploads', 'rooms');
    const schedulesDir = path.join(__dirname, 'uploads', 'schedules');
    
    // Carregar ficheiros da pasta rooms
    if (fs.existsSync(roomsDir)) {
        fs.readdirSync(roomsDir).forEach(file => {
            const filePath = path.join(roomsDir, file);
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv({ separator: ';' }))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    salas = results;
                });
        });
    }

    // Carregar ficheiros da pasta schedules
    if (fs.existsSync(schedulesDir)) {
        fs.readdirSync(schedulesDir).forEach(file => {
            const filePath = path.join(schedulesDir, file);
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv({ separator: ';' }))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    horarios.push(results);
                });
        });
    }
}

// Garantir que as pastas existem e carregar ficheiros na inicialização
garantirDiretorios();
carregarFicheiros();


// Rota para o menu principal (home page)
app.get('/', (req, res) => {
    res.render('layout', { content: 'dashboard' });
});

// Rota para o upload de horários (exibe tabela com horários carregados)
app.get('/horarios', (req, res) => {
    res.render('layout', { content: 'schedules', horarios: horarios });  // Passar a variável horarios para a view
});

app.get('/horarios/tabela', (req, res) => {
    const page = parseInt(req.query.page) || 1;   // Página solicitada
    const pageSize = parseInt(req.query.pageSize) || 250; // Tamanho da página (número de itens por página)

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const horariosPaginados = horarios[0].slice(startIndex, endIndex);
    // Define o cabeçalho Content-Type como application/json
    res.set('Content-Type', 'application/json'); 
    const totalPages = Math.ceil(horarios[0].length / pageSize);
    res.json(horariosPaginados);
});


// Rota para o upload de salas
app.get('/salas', (req, res) => {
    res.render('layout', { content: 'rooms', salas: salas });  // Passar a variável horarios para a view
});


// Endpoint para carregar horários (gravar em /uploads/schedules)
app.post('/upload/horarios', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum ficheiro foi enviado. Por favor, selecione um ficheiro CSV.');
    }

    const schedulesDir = path.join(__dirname, 'uploads', 'schedules');
    const filePath = path.join(schedulesDir, req.file.filename);

    // Mover o novo ficheiro para a pasta schedules
    fs.renameSync(req.file.path, filePath);

    // Processar o ficheiro
    const results = [];
    fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
            horarios.push(results);
            res.send('Horários carregados com sucesso!');
        });
});


// Endpoint para carregar salas (apenas um ficheiro permitido)
app.post('/upload/salas', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum ficheiro foi enviado. Por favor, selecione um ficheiro CSV.');
    }

    const roomsDir = path.join(__dirname, 'uploads', 'rooms');
    const filePath = path.join(roomsDir, req.file.filename);
    
    // Substituir qualquer ficheiro existente
    fs.readdirSync(roomsDir).forEach(file => {
        fs.unlinkSync(path.join(roomsDir, file));  // Remover ficheiros anteriores
    });
    
    // Mover o novo ficheiro para a pasta schedules
    fs.renameSync(req.file.path, filePath);
    
    // Processar o ficheiro
    const results = [];
    // Processar o CSV e substituir qualquer ficheiro de salas existente
    fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
            salas = results;  // Armazenar o conteúdo da sala
            res.send('Salas carregadas com sucesso!');
        });
});

// Rota para o upload de salas (só permite um ficheiro)
app.get('/salas', (req, res) => {
    res.render('layout', { content: 'rooms', sala });  // Passa o ficheiro de sala para a view
});


// Servidor
app.listen(3000, () => {
    console.log('Servidor a correr na porta 3000');
}); 

