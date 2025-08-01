const { DataTypes } = require('sequelize');
const database = require('#services/db.service');
const bcryptSevice = require('#services/bcrypt.service');

const User = database.define(
  'User',
  {
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(175),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('client', 'coach', 'parent'),
      defaultValue: 'client',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    fullName: {
      type: DataTypes.VIRTUAL,
      get: function () {
        const firstName = this.getDataValue('firstName');
        const lastName = this.getDataValue('lastName');
        return `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim();
      },
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

User.beforeValidate((user, options) => {
  const password = user.password;
  const isHashed = typeof password === 'string' && password.startsWith('$2');
  if (!isHashed) {
    user.password = bcryptSevice.hashPassword(user);
  }
});

User.associate = (models) => {
  models.User.hasMany(models.DisabledRefreshToken, {
    foreignKey: 'UserId',
    as: 'disabledRefreshTokens',
  });
  models.User.hasMany(models.Booking, { foreignKey: 'clientId', as: 'bookings' });
  models.User.hasMany(models.Lesson, { foreignKey: 'coachId', as: 'lessons' });
  models.User.hasMany(models.Progress, { foreignKey: 'clientId', as: 'progress' });
  models.User.hasMany(models.Achievement, { foreignKey: 'clientId', as: 'achievements' });
};

User.findById = function (id) {
  return this.findByPk(id);
};

User.findOneByEmail = function (email) {
  const query = { where: { email } };
  return this.findOne(query);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
