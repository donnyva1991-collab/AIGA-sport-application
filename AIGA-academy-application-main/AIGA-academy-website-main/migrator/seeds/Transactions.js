const { Transaction, User, Product } = require('#models');

module.exports = {
  run: async () => {
    try {
      const user = await User.findOne();
      const product = await Product.findOne();
      if (user && product) {
        await Transaction.bulkCreate([
          {
            fromUserId: user.id,
            productId: product.id,
            type: 'purchase',
            amount: product.cost + product.deliveryCost
          }
        ]);
        console.log('Transactions seeded');
      }
    } catch (error) {
      console.error('Transactions seeder error:', error);
      throw error;
    }
  }
};
