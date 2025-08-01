const { Message, User } = require('#models');
const { Err } = require('#factories/errors');
const { Op } = require('sequelize');
const { createOKResponse, createErrorResponse } = require('#factories/responses/api');
const { body, param, query, validationResult } = require('express-validator');

module.exports = ChatController;

function ChatController() {
  const validateMessage = [
    body('toUserId').isInt().withMessage('toUserId must be an integer'),
    body('text').isString().notEmpty().withMessage('text must be a non-empty string'),
  ];

  const validateUserId = [
    param('userId').isInt().withMessage('userId must be an integer'),
  ];

  const validateRoom = [
    param('room').isString().notEmpty().withMessage('room must be a non-empty string'),
  ];

  const validatePagination = [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be an integer between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset must be a non-negative integer'),
  ];

  const _sendMessage = async (req, res) => {
    try {
      await Promise.all(validateMessage.map((check) => check.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Object.assign(new Err(errors.array()[0].msg), { name: 'ValidationError', status: 400 });
      }

      const fromUserId = req.token.id;
      const { toUserId, text } = req.body;

      const message = await Message.create({
        fromUserId,
        toUserId,
        text,
        room: null, // Приватный чат
      });

      return createOKResponse({
        res,
        content: { message },
      });
    } catch (error) {
      return createErrorResponse({ res, error });
    }
  };

  const _getDialog = async (req, res) => {
    try {
      await Promise.all([...validateUserId, ...validatePagination].map((check) => check.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Object.assign(new Err(errors.array()[0].msg), { name: 'ValidationError', status: 400 });
      }

      const userId = req.token.id;
      const otherUserId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { fromUserId: userId, toUserId: otherUserId, room: null },
            { fromUserId: otherUserId, toUserId: userId, room: null },
          ],
        },
        order: [['createdAt', 'ASC']],
        limit,
        offset,
      });

      return createOKResponse({
        res,
        content: { messages },
      });
    } catch (error) {
      return createErrorResponse({ res, error });
    }
  };

  const _sendGroupMessage = async (req, res) => {
    try {
      await Promise.all([body('room').isString().notEmpty(), body('text').isString().notEmpty()].map((check) => check.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Object.assign(new Err(errors.array()[0].msg), { name: 'ValidationError', status: 400 });
      }

      const fromUserId = req.token.id;
      const { room, text } = req.body;

      const message = await Message.create({
        fromUserId,
        toUserId: null,
        text,
        room,
      });

      return createOKResponse({
        res,
        content: { message },
      });
    } catch (error) {
      return createErrorResponse({ res, error });
    }
  };

  const _getRoomHistory = async (req, res) => {
    try {
      await Promise.all([...validateRoom, ...validatePagination].map((check) => check.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Object.assign(new Err(errors.array()[0].msg), { name: 'ValidationError', status: 400 });
      }

      const room = req.params.room;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const messages = await Message.findAll({
        where: { room },
        order: [['createdAt', 'ASC']],
        limit,
        offset,
      });

      return createOKResponse({
        res,
        content: { messages },
      });
    } catch (error) {
      return createErrorResponse({ res, error });
    }
  };

  return {
    sendMessage: _sendMessage,
    getDialog: _getDialog,
    sendGroupMessage: _sendGroupMessage,
    getRoomHistory: _getRoomHistory,
  };
}
