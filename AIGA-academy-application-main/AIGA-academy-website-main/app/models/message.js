const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    fromUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'messages',
    timestamps: true, // добавляет createdAt, updatedAt
  });

  return Message;
};
