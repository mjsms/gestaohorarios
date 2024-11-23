module.exports = (sequelize, DataTypes) => {
    const Shift = sequelize.define('Shift', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        subjectId: { type: DataTypes.INTEGER, allowNull: false },
        classGroupId: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        enrollment: { type: DataTypes.INTEGER, allowNull: false }
    }, { tableName: 'Shift', timestamps: false });

    Shift.associate = models => {
        Shift.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
        Shift.belongsTo(models.ClassGroup, { foreignKey: 'classGroupId', as: 'classGroup' });
        Shift.hasMany(models.Schedule, { foreignKey: 'shiftId', as: 'schedules' });
    };

    return Shift;
};
