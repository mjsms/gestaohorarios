module.exports = (sequelize, DataTypes) => {
    const ScheduleFeature = sequelize.define('ScheduleFeature', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        scheduleId: { type: DataTypes.INTEGER, allowNull: false },
        featureId: { type: DataTypes.INTEGER, allowNull: false },
        featureType: { 
            type: DataTypes.ENUM('requested', 'real'), 
            allowNull: false 
        }
    }, { tableName: 'ScheduleFeature', timestamps: false });

    ScheduleFeature.associate = models => {
        ScheduleFeature.belongsTo(models.Schedule, { foreignKey: 'scheduleId', as: 'schedule' });
        ScheduleFeature.belongsTo(models.Feature, { foreignKey: 'featureId', as: 'feature' });
    };

    return ScheduleFeature;
};
