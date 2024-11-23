// config/database.js
const { Sequelize } = require('sequelize');

// Configurar a conexão com o SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'  // Caminho do arquivo onde a base de dados será armazenada
});

module.exports = sequelize;
