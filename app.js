const express = require('express');
const session = require('express-session');

const classroomRoutes = require('./routes/classRoomRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const authStudentRoutes = require('./routes/authStudentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const scannerRoutes = require('./routes/scannerRoutes');
const bcrypt = require('bcryptjs');
const { models } = require('./db');
const requireAuth = require('./middleware/auth'); 
const app = express();

app.use(session({
    secret: 'fasfasffsaf214123r12412d87312923x12x*', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Em produção use true se estiver usando HTTPS
  }));

// Middleware to parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Middleware para JSON
app.use(express.json());

// Definir o motor de templates como EJS
app.use(express.static('public'));
app.set('view engine', 'ejs');


app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Pesquisar o utilizador na base de dados
    const user = await models.User.findOne({ where: { username } });
    
    if (!user) {
        // Se não encontrou o utilizador
        return res.render('login', { errorMessage: 'Credenciais inválidas' });
    }

    // Verificar a senha
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        // Senha incorreta
        return res.render('login', { errorMessage: 'Credenciais inválidas' });
    }

    // Autenticação bem-sucedida
    req.session.userId = user.id;
    res.redirect('/'); // Ou a página que quiser após login bem-sucedido
});

// Set up routes with specific base paths
app.use('/classroom', requireAuth, classroomRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/auth', authStudentRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/qrcode', scannerRoutes);

// Rota para o menu principal (home page)
app.get('/', requireAuth, (req, res) => {
    res.render('layout', { content: 'dashboard' });
});


// Servidor
app.listen(3000, () => {
    console.log('Servidor a correr na porta 3000');
}); 

