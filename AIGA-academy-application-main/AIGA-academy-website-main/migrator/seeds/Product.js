const { Product } = require('#models');

module.exports = {
  run: async () => {
    try {
      await Product.bulkCreate([
        {
          image: 'https://example.com/images/product123.jpg',
          name: 'Running Shoes',
          cost: 89.99,
          isNew: true,
          deliveryCost: 5.99,
          deliveryCity: 'Almaty',
          desc: 'Lightweight running shoes for everyday training.'
        }
      ]);
      console.log('Products seeded');
    } catch (error) {
      console.error('Product seeder error:', error);
      throw error;
    }
  }
};
