const express = require('express');
const router = express.Router();
const authController = require('../controllers/authStudentController');

// Rota para registro
router.post('/register', authController.registerStudent);

// Rota para login
router.post('/login', authController.loginStudent);

module.exports = router;
