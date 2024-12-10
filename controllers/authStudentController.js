const { models } = require('../db');

// Registro de um novo aluno
exports.registerStudent = async (req, res) => {
    const { n_aluno, email, password, turma } = req.body;

    if (!n_aluno || !email || !password || !turma) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    try {
        // Verifica se o aluno já existe
        const existingStudent = await models.Student.findOrCreate({ where: { number: n_aluno } });

        if (existingStudent.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Número de aluno já registrado." });
        }

        // Insere o aluno
        const [classGroup] = await models.Classgroup.findOrCreate({ where: { name: turma } });

        const newVStudent = await models.Student.create({
            number: n_aluno,
            password: password,
            email: email,
            classGroupId: classGroup,
        });

        res.status(201).json({ success: true, student: newVStudent.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erro ao registrar o aluno." });
    }
};

// Login de um aluno
exports.loginStudent = async (req, res) => {
    const { n_aluno, password } = req.body;

    if (!n_aluno || !password) {
        return res.status(400).json({ success: false, message: "Número de aluno e senha são obrigatórios." });
    }

    try {
        const result = await models.Student.find({ where: { number: n_aluno, senha: password } });
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Credenciais inválidas." });
        }

        res.status(200).json({ success: true, student: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erro ao realizar login." });
    }
};
