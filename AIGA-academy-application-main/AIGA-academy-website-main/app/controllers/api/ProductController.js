const { createOKResponse, createErrorResponse } = require('#factories/responses/api');
const bankFacade = require('#facades/bank');
const { Product, Transaction } = require('#models');
const { body, validationResult } = require('express-validator');
const logger = require('#services/logger');

module.exports = function ProductController() {
  const validatePurchase = [
    body('productId').isInt().withMessage('productId must be an integer')
  ];

  const _getProducts = async (req, res) => {
    try {
      const products = await Product.findAll();
      return createOKResponse({ res, content: { products } });
    } catch (error) {
      logger.error(`GetProducts error: ${error.message}`);
      return createErrorResponse({ res, error: { message: error.message }, status: 500 });
    }
  };

  const _buyProduct = async (req, res) => {
    try {
      await validatePurchase.map(check => check.run(req));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(errors.array()[0].msg, { cause: { status: 400 } });
      }

      const userId = req.token.id;
      const { productId } = req.body;
      const product = await Product.findByPk(productId);
      if (!product) throw new Error('Product not found', { cause: { status: 404 } });

      const totalCost = product.cost + product.deliveryCost;
      const balance = await bankFacade.withdraw({ userId, amount: totalCost });
      
      await Transaction.create({
        type: 'purchase',
        fromUserId: userId,
        productId,
        amount: totalCost
      });

      logger.info(`Purchase: userId=${userId}, productId=${productId}, amount=${totalCost}`);
      return createOKResponse({ res, content: { balance, product } });
    } catch (error) {
      logger.error(`BuyProduct error: ${error.message}`, { userId: req.token.id });
      return createErrorResponse({ res, error: { message: error.message }, status: error.cause?.status || 500 });
    }
  };

  return { getProducts: _getProducts, buyProduct: _buyProduct };
};
