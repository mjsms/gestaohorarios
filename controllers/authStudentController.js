const bcrypt = require('bcrypt');
const { models } = require('../db');

// Número de rounds para hashing
const SALT_ROUNDS = 10;

// Registro de um novo aluno
exports.registerStudent = async (req, res) => {
    const { numero, email, password, turma } = req.body;

    if (!numero || !email || !password || !turma) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    try {
        // Verifica se o aluno já existe
        const existingStudent = await models.Student.findOne({ where: { email } });

        if (existingStudent) {
            return res.status(400).json({ success: false, message: "Email já registrado." });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Insere ou busca o grupo da turma
        const [classGroup] = await models.ClassGroup.findOrCreate({ where: { name: turma } });

        // Cria o novo aluno
        const newStudent = await models.Student.create({
            number: numero,
            password: hashedPassword, // Salva o hash da senha
            email: email,
            classGroupId: classGroup.id, // Usar a ID do grupo
        });

        res.status(201).json({ success: true, message: "Registro criado", student: { email: newStudent.email, number: newStudent.number } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erro ao registrar o aluno." });
    }
};

// Login de um aluno
exports.loginStudent = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email e senha são obrigatórios." });
    }

    try {
        // Busca o aluno com base no email
        const student = await models.Student.findOne({ where: { email } });

        if (!student) {
            console.log(`Login falhou para o email: ${email}`);
            return res.status(401).json({ success: false, message: "Credenciais inválidas." });
        }

        // Verifica a senha com bcrypt
        const isPasswordValid = await bcrypt.compare(password, student.password);

        if (!isPasswordValid) {
            console.log(`Senha inválida para o email: ${email}`);
            return res.status(401).json({ success: false, message: "Credenciais inválidas." });
        }

        res.status(200).json({ success: true, message: "Login efetuado", student: { email: student.email, number: student.number, classGroupId: student.classGroupId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erro ao realizar login." });
    }
};
