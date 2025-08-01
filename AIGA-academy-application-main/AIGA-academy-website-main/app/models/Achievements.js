const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

module.exports = (sequelize) => {
  const Achievement = sequelize.define('Achievement', {
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., "Completed 10 Sessions"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    achievedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'achievements',
    timestamps: true,
    paranoid: true,
  });

  Achievement.associate = (models) => {
    Achievement.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' });
  };

  return Achievement;
};
