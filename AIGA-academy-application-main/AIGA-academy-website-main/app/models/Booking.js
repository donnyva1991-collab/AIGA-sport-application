const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  }, {
    tableName: 'bookings',
    timestamps: true,
    paranoid: true,
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' });
    Booking.belongsTo(models.Lesson, { foreignKey: 'lessonId', as: 'lesson' });
  };

  return Booking;
};
