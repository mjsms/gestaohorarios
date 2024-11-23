module.exports = (sequelize, DataTypes) => {
    const Subject = sequelize.define('Subject', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        academicProgramId: { type: DataTypes.INTEGER, allowNull: false }
    }, { tableName: 'Subject', timestamps: false });

    Subject.associate = models => {
        Subject.belongsTo(models.AcademicProgram, { foreignKey: 'academicProgramId', as: 'academicProgram' });
        Subject.hasMany(models.Shift, { foreignKey: 'subjectId', as: 'shifts' });
    };

    return Subject;
};
