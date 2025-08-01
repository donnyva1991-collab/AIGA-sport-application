const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

module.exports = (sequelize) => {
  const Lesson = sequelize.define('Lesson', {
    coachId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'booked', 'cancelled'),
      defaultValue: 'available',
    },
  }, {
    tableName: 'lessons',
    timestamps: true,
    paranoid: true,
  });

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.User, { foreignKey: 'coachId', as: 'coach' });
    Lesson.hasMany(models.Booking, { foreignKey: 'lessonId', as: 'bookings' });
  };

  return Lesson;
};
