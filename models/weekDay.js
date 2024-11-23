module.exports = (sequelize, DataTypes) => {
    const Weekday = sequelize.define('Weekday', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        abbreviation: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isHoliday: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'Weekday',
        timestamps: false
    });

    Weekday.associate = models => {
        Weekday.hasMany(models.Schedule, { foreignKey: 'weekdayId', as: 'schedules' });
    };

    return Weekday;
};
