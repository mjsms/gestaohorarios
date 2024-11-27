module.exports = (sequelize, DataTypes) => {
    const ClassRoom = sequelize.define('ClassRoom', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        capacity: { type: DataTypes.INTEGER, allowNull: false }
    }, { tableName: 'ClassRoom', timestamps: false });

    ClassRoom.associate = models => {
        ClassRoom.hasMany(models.Schedule, { foreignKey: 'classRoomId', as: 'schedules' });
        ClassRoom.hasMany(models.ClassRoomFeature, { foreignKey: 'classRoomId', as: 'classRoomFeatures' });
        ClassRoom.belongsToMany(models.Feature, {
            through: models.ClassRoomFeature, 
            foreignKey: 'classRoomId', 
            otherKey: 'featureId',     
        });
    };

    return ClassRoom;
};
