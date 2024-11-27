module.exports = (sequelize, DataTypes) => {
    const Feature = sequelize.define('Feature', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false }
    }, { tableName: 'Feature', timestamps: false });

    Feature.associate = models => {
        Feature.hasMany(models.ScheduleFeature, { foreignKey: 'featureId', as: 'scheduleFeatures' });
        Feature.hasMany(models.ClassRoomFeature, { foreignKey: 'featureId', as: 'classRoomFeatures' });    
        Feature.belongsToMany(models.ClassRoom, {
            through: models.ClassRoomFeature, // Tabela intermediária
            foreignKey: 'featureId', // Chave estrangeira na tabela de ligação
            otherKey: 'classRoomId', // Chave estrangeira para a outra entidade
        });
        Feature.belongsToMany(models.Schedule, {
            through: models.ScheduleFeature, // Tabela intermediária
            foreignKey: 'featureId', // Chave estrangeira na tabela de ligação
            otherKey: 'scheduleId', // Chave estrangeira para a outra entidade
        });
    };

    return Feature;
};
