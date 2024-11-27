module.exports = (sequelize, DataTypes) => {
    const ScheduleVersion = sequelize.define('ScheduleVersion', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        description: { type: DataTypes.STRING, allowNull: true },
        isCurrent: { type: DataTypes.BOOLEAN, allowNull: false },
        status: { 
            type: DataTypes.ENUM('pending', 'imported', 'processed'), 
            allowNull: false 
        },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    }, { tableName: 'ScheduleVersion', timestamps: false });

    ScheduleVersion.associate = models => {
        ScheduleVersion.hasMany(models.Schedule, { foreignKey: 'versionId', as: 'schedules' });
    };

    return ScheduleVersion;
};
