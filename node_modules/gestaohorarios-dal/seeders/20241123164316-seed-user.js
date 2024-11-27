// seeders/xxxx-create-admin-user.js
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface) => {
        const hashedPassword = await bcrypt.hash('admin123', 10); // Substitua pelo password desejado
        await queryInterface.bulkInsert('Users', [
            {
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('Users', { username: 'admin' });
    },
};
