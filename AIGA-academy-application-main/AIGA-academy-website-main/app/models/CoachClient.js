const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

module.exports = (sequelize) => {
  const CoachClient = sequelize.define('CoachClient', {
    coachId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'coach_clients',
    timestamps: true,
  });

  CoachClient.associate = (models) => {
    CoachClient.belongsTo(models.User, { foreignKey: 'coachId', as: 'coach' });
    CoachClient.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' });
  };

  return CoachClient;
};
