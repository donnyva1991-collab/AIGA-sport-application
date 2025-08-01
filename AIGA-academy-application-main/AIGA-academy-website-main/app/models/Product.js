const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    image: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    cost: { type: DataTypes.FLOAT, allowNull: false },
    isNew: { type: DataTypes.BOOLEAN, defaultValue: false },
    deliveryCost: { type: DataTypes.FLOAT, allowNull: false },
    deliveryCity: { type: DataTypes.STRING, allowNull: false },
    desc: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'products',
    timestamps: true,
    paranoid: true
  });
  return Product;
};
