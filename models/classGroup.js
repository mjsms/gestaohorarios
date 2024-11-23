module.exports = (sequelize, DataTypes) => {
    const ClassGroup = sequelize.define('ClassGroup', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false }
    }, { tableName: 'ClassGroup', timestamps: false });

    ClassGroup.associate = models => {
        ClassGroup.hasMany(models.Shift, { foreignKey: 'classGroupId', as: 'shifts' });
    };

    return ClassGroup;
};
