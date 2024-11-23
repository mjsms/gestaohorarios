module.exports = (sequelize, DataTypes) => {
    const AcademicProgram = sequelize.define('AcademicProgram', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false }
    }, { tableName: 'AcademicProgram', timestamps: false });

    AcademicProgram.associate = models => {
        AcademicProgram.hasMany(models.Subject, { foreignKey: 'academicProgramId', as: 'subjects' });
    };

    return AcademicProgram;
};
