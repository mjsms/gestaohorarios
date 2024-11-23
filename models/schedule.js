module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        versionId: { type: DataTypes.INTEGER, allowNull: false },
        shiftId: { type: DataTypes.INTEGER, allowNull: false },
        classRoomId: { type: DataTypes.INTEGER, allowNull: false },
        weekdayId: { type: DataTypes.INTEGER, allowNull: false },
        startTime: { type: DataTypes.TIME, allowNull: false },
        endTime: { type: DataTypes.TIME, allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false }
    }, { tableName: 'Schedule', timestamps: false });

    Schedule.associate = models => {
        Schedule.belongsTo(models.ScheduleVersion, { foreignKey: 'versionId', as: 'version' });
        Schedule.belongsTo(models.Shift, { foreignKey: 'shiftId', as: 'shift' });
        Schedule.belongsTo(models.ClassRoom, { foreignKey: 'classRoomId', as: 'classRoom' });
        Schedule.belongsTo(models.Weekday, { foreignKey: 'weekdayId', as: 'weekday' });
        Schedule.hasMany(models.QualityIssue, { foreignKey: 'scheduleId', as: 'qualityIssues' });
        Schedule.hasMany(models.ScheduleFeature, { foreignKey: 'scheduleId', as: 'features' });
    };

    return Schedule;
};
