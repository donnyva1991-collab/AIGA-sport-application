const { Lesson, Booking, User } = require('#models');
const { Err } = require('#factories/errors');
const sequelize = require('#services/db.service');
const bankFacade = require('#facades/bank');

module.exports = {
  createLesson,
  bookLesson,
  validateBooking,
  getLessons,
};

async function createLesson({ coachId, title, startTime, endTime, price }) {
  if (new Date(startTime) >= new Date(endTime)) {
    throw new Err('Start time must be before end time', 400);
  }
  const lesson = await Lesson.create({ coachId, title, startTime, endTime, price, status: 'available' });
  return lesson;
}

async function bookLesson({ clientId, lessonId }) {
  return await sequelize.transaction(async (t) => {
    const lesson = await Lesson.findByPk(lessonId, { lock: t.LOCK.UPDATE, transaction: t });
    if (!lesson || lesson.status !== 'available') {
      throw new Err('Lesson not available', 400);
    }
    const client = await User.findByPk(clientId, { transaction: t });
    if (!client || client.balance < lesson.price) {
      throw new Err('Insufficient funds or user not found', 403);
    }

    const booking = await Booking.create({ clientId, lessonId, status: 'pending' }, { transaction: t });
    lesson.status = 'booked';
    await lesson.save({ transaction: t });

    return booking;
  });
}

async function validateBooking({ coachId, bookingId, action }) {
  if (!['approve', 'reject'].includes(action)) {
    throw new Err('Invalid action', 400);
  }
  return await sequelize.transaction(async (t) => {
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Lesson, as: 'lesson' }],
      transaction: t,
    });
    if (!booking || booking.lesson.coachId !== coachId) {
      throw new Err('Booking not found or unauthorized', 403);
    }
    if (action === 'approve') {
      booking.status = 'approved';
      await bankFacade.transfer({
        fromUserId: booking.clientId,
        toUserId: coachId,
        amount: booking.lesson.price,
      });
    } else {
      booking.status = 'rejected';
      const lesson = await Lesson.findByPk(booking.lessonId, { transaction: t });
      lesson.status = 'available';
      await lesson.save({ transaction: t });
    }
    await booking.save({ transaction: t });
    return booking;
  });
}

async function getLessons({ coachId, status }) {
  const where = { coachId };
  if (status) where.status = status;
  return await Lesson.findAll({ where, order: [['startTime', 'ASC']] });
}
async function getLessons({ coachId, status }) {
  const where = { coachId };
  if (status) where.status = status;
  return await Lesson.findAll({ where, order: [['startTime', 'ASC']] });
}
async function getLessons({ coachId, where = {} }) {
  where.coachId = coachId;
  return await Lesson.findAll({ where, order: [['startTime', 'ASC']] });
}
