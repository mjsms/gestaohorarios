const express = require('express');

const classroomRoutes = require('./routes/classRoomRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const authStudentRoutes = require('./routes/authStudentRoutes');

const app = express();

// Middleware to parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Middleware para JSON
app.use(express.json());

// Definir o motor de templates como EJS
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Set up routes with specific base paths
app.use('/classroom', classroomRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/auth', authStudentRoutes);

// Rota para o menu principal (home page)
app.get('/', (req, res) => {
    res.render('layout', { content: 'dashboard' });
});

// Servidor
app.listen(3000, () => {
    console.log('Servidor a correr na porta 3000');
}); 

