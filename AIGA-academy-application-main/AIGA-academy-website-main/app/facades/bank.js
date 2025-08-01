const { User } = require('#models/User');
const { Transaction } = require('#models/Transactions');
const { Err } = require('#factories/errors');
const sequelize = require('#services/db.service');
const logger = require('#services/logger');

module.exports = {
  deposit,
  withdraw,
  transfer,
  getHistory
};

async function deposit({ userId, amount }) {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw Object.assign(new Err('Amount must be a positive number'), { status: 400 });
  }

  return await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { lock: t.LOCK.UPDATE, transaction: t });
    if (!user) {
      throw Object.assign(new Err('User not found'), { status: 404 });
    }

    user.balance += amount;
    await user.save({ transaction: t });

    await Transaction.create(
      { type: 'deposit', toUserId: userId, amount },
      { transaction: t }
    );

    return user.balance;
  });
}

async function withdraw({ userId, amount }) {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw Object.assign(new Err('Amount must be a positive number'), { status: 400 });
  }

  return await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { lock: t.LOCK.UPDATE, transaction: t });
    if (!user) {
      throw Object.assign(new Err('User not found'), { status: 404 });
    }
    if (user.balance < amount) {
      throw Object.assign(new Err('Insufficient funds'), { status: 403 });
    }

    user.balance -= amount;
    await user.save({ transaction: t });

    await Transaction.create(
      { type: 'withdraw', fromUserId: userId, amount },
      { transaction: t }
    );

    return user.balance;
  });
}

async function transfer({ fromUserId, toUserId, amount }) {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw Object.assign(new Err('Amount must be a positive number'), { status: 400 });
  }
  if (!Number.isInteger(toUserId)) {
    throw Object.assign(new Err('toUserId must be an integer'), { status: 400 });
  }

  return await sequelize.transaction(async (t) => {
    const [fromUser, toUser] = await Promise.all([
      User.findByPk(fromUserId, { lock: t.LOCK.UPDATE, transaction: t }),
      User.findByPk(toUserId, { lock: t.LOCK.UPDATE, transaction: t })
    ]);

    if (!fromUser) {
      throw Object.assign(new Err('Sender not found'), { status: 404 });
    }
    if (!toUser) {
      throw Object.assign(new Err('Recipient not found'), { status: 404 });
    }
    if (fromUser.balance < amount) {
      throw Object.assign(new Err('Insufficient funds'), { status: 403 });
    }

    fromUser.balance -= amount;
    toUser.balance += amount;

    await Promise.all([
      fromUser.save({ transaction: t }),
      toUser.save({ transaction: t })
    ]);

    await Transaction.create(
      { type: 'transfer', fromUserId, toUserId, amount },
      { transaction: t }
    );

    return true;
  });
}

async function getHistory({ userId }) {
  const history = await Transaction.findAll({
    where: {
      [sequelize.Op.or]: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    },
    order: [['createdAt', 'DESC']]
  });

  return history;
}
