const { User, Booking, Transaction, Progress, Achievement } = require('#models');
const { Err } = require('#factories/errors');
const { Op } = require('sequelize');

module.exports = {
  getClientDashboard,
  updateClientProfile,
  addClientProgress,
  addClientAchievement,
};

async function getClientDashboard({ clientId }) {
  const [client, bookings, transactions, progress, achievements] = await Promise.all([
    User.findByPk(clientId, { attributes: { exclude: ['password'] } }),
    Booking.findAll({ where: { clientId }, include: [{ model: Lesson, as: 'lesson' }] }),
    Transaction.findAll({ where: { [Op.or]: [{ fromUserId: clientId }, { toUserId: clientId }] } }),
    Progress.findAll({ where: { clientId }, order: [['recordedAt', 'DESC']] }),
    Achievement.findAll({ where: { clientId }, order: [['achievedAt', 'DESC']] }),
  ]);
  if (!client) throw new Err('Client not found', 404);
  return { client, bookings, transactions, progress, achievements };
}

async function updateClientProfile({ coachId, clientId, updates }) {
  const client = await User.findByPk(clientId);
  if (!client) throw new Err('Client not found', 404);
  const coachClient = await CoachClient.findOne({ where: { coachId, clientId } });
  if (!coachClient) throw new Err('Unauthorized: Not your client', 403);
  await client.update(updates, { fields: ['firstName', 'lastName', 'phone', 'bio'] });
  return client;
}

async function addClientProgress({ coachId, clientId, metric, value, notes }) {
  const client = await User.findByPk(clientId);
  if (!client) throw new Err('Client not found', 404);
  const coachClient = await CoachClient.findOne({ where: { coachId, clientId } });
  if (!coachClient) throw new Err('Unauthorized: Not your client', 403);
  const progress = await Progress.create({ clientId, metric, value, notes });
  return progress;
}

async function addClientAchievement({ coachId, clientId, title, description }) {
  const client = await User.findByPk(clientId);
  if (!client) throw new Err('Client not found', 404);
  const coachClient = await CoachClient.findOne({ where: { coachId, clientId } });
  if (!coachClient) throw new Err('Unauthorized: Not your client', 403);
  const achievement = await Achievement.create({ clientId, title, description });
  return achievement;
}
