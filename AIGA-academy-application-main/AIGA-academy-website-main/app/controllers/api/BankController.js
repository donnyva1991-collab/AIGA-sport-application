const { createOKResponse, createErrorResponse } = require('#factories/responses/api');
const bankFacade = require('#facades/bank');
const { body, validationResult } = require('express-validator');
const logger = require('#services/logger');

module.exports = BankController;

function BankController() {
  const validateAmount = [
   body('amount').isFloat({ min: 6000, max: 300000 }).withMessage('Amount must be between 6000 and 300000 for gym services'),
      .custom((value) => {
        if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
          throw new Error('Amount must have at most 2 decimal places');
        }
        return true;
      }),
  ];

  const _deposit = async (req, res) => {
    try {
      await validateAmount.map((check) => check.run(req));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Object.assign(new Error(errors.array()[0].msg), { name: 'ValidationError', status: 400 });
      }

      const userId = req.token.id;
      const { amount } = req.body;
      const balance = await bankFacade.deposit({ userId, amount });

      logger.info(`Deposit: userId=${userId}, amount=${amount}, newBalance=${balance}`);
      return createOKResponse({ res, content: { balance } });
    } catch (error) {
      logger.error(`Deposit error: ${error.message}`, { userId: req.token.id, error });
      return createErrorResponse({ res, error: { message: error.message }, status: error.status || 500 });
    }
  };

  const _withdraw = async (req, res) => {
    try {
      await validateAmount.map((check) => check.run(req));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Object.assign(new Error(errors.array()[0].msg), { name: 'ValidationError', status: 400 });
      }

      const userId = req.token.id;
      const { amount } = req.body;
      const balance = await bankFacade.withdraw({ userId, amount });

      logger.info(`Withdraw: userId=${userId}, amount=${amount}, newBalance=${balance}`);
      return createOKResponse({ res, content: { balance } });
    } catch (error) {
      logger.error(`Withdraw error: ${error.message}`, { userId: req.token.id, error });
      return createErrorResponse({ res, error: { message: error.message }, status: error.status || 500 });
    }
  };

  const _transfer = async (req, res) => {
    try {
      await [
        ...validateAmount,
        body('toUserId')
          .isInt()
          .withMessage('toUserId must be an integer')
      ].map((check) => check.run(req));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Object.assign(new Error(errors.array()[0].msg), { name: 'ValidationError', status: 400 });
      }

      const fromUserId = req.token.id;
      const { toUserId, amount } = req.body;
      await bankFacade.transfer({ fromUserId, toUserId, amount });

      logger.info(`Transfer: fromUserId=${fromUserId}, toUserId=${toUserId}, amount=${amount}`);
      return createOKResponse({ res, content: { success: true } });
    } catch (error) {
      logger.error(`Transfer error: ${error.message}`, { fromUserId: req.token.id, error });
      return createErrorResponse({ res, error: { message: error.message }, status: error.status || 500 });
    }
  };

  const _getHistory = async (req, res) => {
    try {
      const userId = req.token.id;
      const history = await bankFacade.getHistory({ userId });

      logger.info(`History retrieved: userId=${userId}`);
      return createOKResponse({ res, content: { history } });
    } catch (error) {
      logger.error(`GetHistory error: ${error.message}`, { userId: req.token.id, error });
      return createErrorResponse({ res, error: { message: error.message }, status: error.status || 500 });
    }
  };

  return {
    deposit: _deposit,
    withdraw: _withdraw,
    transfer: _transfer,
    getHistory: _getHistory
  };
}
