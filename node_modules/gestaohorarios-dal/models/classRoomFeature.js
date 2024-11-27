module.exports = (sequelize, DataTypes) => {
    const ClassRoomFeature = sequelize.define('ClassRoomFeature', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        featureId: { type: DataTypes.INTEGER, allowNull: false },
        classRoomId: { type: DataTypes.INTEGER, allowNull: false }
    }, { tableName: 'ClassRoomFeature', timestamps: false });

    ClassRoomFeature.associate = models => {
        ClassRoomFeature.belongsTo(models.Feature, { foreignKey: 'featureId', as: 'feature' });
        ClassRoomFeature.belongsTo(models.ClassRoom, { foreignKey: 'classRoomId', as: 'classRoom' });
    };

    return ClassRoomFeature;
};
