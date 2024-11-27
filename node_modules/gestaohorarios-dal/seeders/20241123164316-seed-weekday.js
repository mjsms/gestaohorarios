module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('Weekday', [
          { name: 'Sunday', abbreviation: 'Sun', isHoliday: true },
          { name: 'Monday', abbreviation: 'Mon', isHoliday: false },
          { name: 'Tuesday', abbreviation: 'Tue', isHoliday: false },
          { name: 'Wednesday', abbreviation: 'Wed', isHoliday: false },
          { name: 'Thursday', abbreviation: 'Thu', isHoliday: false },
          { name: 'Friday', abbreviation: 'Fri', isHoliday: false },
          { name: 'Saturday', abbreviation: 'Sat', isHoliday: true }
      ]);
  },
  down: async (queryInterface, Sequelize) => {
      await queryInterface.bulkDelete('Weekday', null, {});
  }
};
