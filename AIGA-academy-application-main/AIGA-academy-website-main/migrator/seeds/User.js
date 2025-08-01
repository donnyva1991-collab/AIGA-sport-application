'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'balance', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'bio');
    await queryInterface.removeColumn('users', 'balance');
  },
};
