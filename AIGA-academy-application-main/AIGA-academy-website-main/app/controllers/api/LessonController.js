const { createOKResponse, createErrorResponse } = require('#factories/responses/api');
const lessonFacade = require('#facades/lesson');
const { body, param, validationResult } = require('express-validator');

module.exports = function LessonController() {
  const validateLesson = [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('startTime').isISO8601().withMessage('Invalid start time'),
    body('endTime').isISO8601().withMessage('Invalid end time'),
    body('price').isFloat({ min: 10 }).withMessage('Price must be at least $10'),
  ];

  const _createLesson = async (req, res) => {
    try {
      await validateLesson.map((check) => check.run(req));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(errors.array()[0].msg, { cause: { status: 400 } });
      }
      const coachId = req.token.id;
      const { title, startTime, endTime, price } = req.body;
      const lesson = await lessonFacade.createLesson({ coachId, title, startTime, endTime, price });
      return createOKResponse({ res, content: { lesson } });
    } catch (error) {
      return createErrorResponse({ res, error, status: error.cause?.status || 500 });
    }
  };

  const _bookLesson = async (req, res) => {
    try {
      await param('lessonId').isInt().run(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(errors.array()[0].msg, { cause: { status: 400 } });
      }
      const clientId = req.token.id;
      const lessonId = parseInt(req.params.lessonId);
      const booking = await lessonFacade.bookLesson({ clientId, lessonId });
      return createOKResponse({ res, content: { booking } });
    } catch (error) {
      return createErrorResponse({ res, error, status: error.cause?.status || 500 });
    }
  };

  const _validateBooking = async (req, res) => {
    try {
      await [param('bookingId').isInt(), body('action').isIn(['approve', 'reject'])].map((check) => check.run(req));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(errors.array()[0].msg, { cause: { status: 400 } });
      }
      const coachId = req.token.id;
      const bookingId = parseInt(req.params.bookingId);
      const action = req.body.action;
      const booking = await lessonFacade.validateBooking({ coachId, bookingId, action });
      return createOKResponse({ res, content: { booking } });
    } catch (error) {
      return createErrorResponse({ res, error, status: error.cause?.status || 500 });
    }
  };

  const _getLessons = async (req, res) => {
    try {
      await param('coachId').isInt().run(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(errors.array()[0].msg, { cause: { status: 400 } });
      }
      const coachId = parseInt(req.params.coachId);
      const status = req.query.status;
      const lessons = await lessonFacade.getLessons({ coachId, status });
      return createOKResponse({ res, content: { lessons } });
    } catch (error) {
      return createErrorResponse({ res, error, status: error.cause?.status || 500 });
    }
  };

  return { createLesson: _createLesson, bookLesson: _bookLesson, validateBooking: _validateBooking, getLessons: _getLessons };
};
const _getMonthlySchedule = async (req, res) => {
  try {
    await [
      param('coachId').isInt(),
      param('year').isInt({ min: 2000, max: 2100 }),
      param('month').isInt({ min: 1, max: 12 }),
    ].map((check) => check.run(req));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg, { cause: { status: 400 } });
    }
    const coachId = parseInt(req.params.coachId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // 0-based
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const lessons = await lessonFacade.getLessons({
      coachId,
      where: {
        startTime: { [Op.between]: [startDate, endDate] },
      },
    });
    return createOKResponse({ res, content: { lessons } });
  } catch (error) {
    return createErrorResponse({ res, error, status: error.cause?.status || 500 });
  }
};
