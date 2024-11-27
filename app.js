const express = require('express');

const classroomRoutes = require('./routes/classRoomRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();

// Set up routes with specific base paths
app.use('/classroom', classroomRoutes);
app.use('/schedule', scheduleRoutes);~


// Definir o motor de templates como EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Middleware to parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Middleware para JSON
app.use(express.json());




// Rota para o menu principal (home page)
app.get('/', (req, res) => {
    res.render('layout', { content: 'dashboard' });
});

// Servidor
app.listen(3000, () => {
    console.log('Servidor a correr na porta 3000');
}); 

