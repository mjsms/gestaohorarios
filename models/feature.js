module.exports = (sequelize, DataTypes) => {
    const Feature = sequelize.define('Feature', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false }
    }, { tableName: 'Feature', timestamps: false });

    Feature.associate = models => {
        Feature.hasMany(models.ScheduleFeature, { foreignKey: 'featureId', as: 'scheduleFeatures' });
        Feature.hasMany(models.ClassRoomFeature, { foreignKey: 'featureId', as: 'classRoomFeatures' });
    };

    return Feature;
};
