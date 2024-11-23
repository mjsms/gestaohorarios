module.exports = (sequelize, DataTypes) => {
    const QualityIssue = sequelize.define('QualityIssue', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        scheduleId: { type: DataTypes.INTEGER, allowNull: false },
        issueType: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true }
    }, { tableName: 'QualityIssue', timestamps: false });

    QualityIssue.associate = models => {
        QualityIssue.belongsTo(models.Schedule, { foreignKey: 'scheduleId', as: 'schedule' });
    };

    return QualityIssue;
};
