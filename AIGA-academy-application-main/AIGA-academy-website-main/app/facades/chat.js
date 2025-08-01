const { Message } = require('#models');
const { Op } = require('sequelize');

module.exports = {
  send,
  getDialog,
};

async function send({ fromUserId, toUserId, text }) {
  const message = await Message.create({
    fromUserId,
    toUserId,
    text,
  });

  return message;
}

async function getDialog({ userId, otherUserId }) {
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { fromUserId: userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: userId },
      ],
    },
    // In Message.create, validate that fromUserId and toUserId have a valid coach-client relationship
    const isValidRelation = await CoachClient.findOne({ where: { coachId: fromUserId, clientId: toUserId } });
    if (!isValidRelation) throw new Err('Invalid recipient for this role', 403);
    order: [['createdAt', 'ASC']],
  });

  return messages;
}
