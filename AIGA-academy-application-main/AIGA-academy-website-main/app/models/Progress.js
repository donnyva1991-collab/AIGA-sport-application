const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

module.exports = (sequelize) => {
  const Progress = sequelize.define('Progress', {
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    metric: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., "weight", "bench_press_reps"
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false, // e.g., 70.5 (kg), 10 (reps)
    },
    recordedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true, // Coach notes, e.g., "Improved form"
    },
  }, {
    tableName: 'progress',
    timestamps: true,
    paranoid: true,
  });

  Progress.associate = (models) => {
    Progress.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' });
  };

  return Progress;
};
