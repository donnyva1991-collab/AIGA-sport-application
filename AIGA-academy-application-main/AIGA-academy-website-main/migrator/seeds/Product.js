const { Product } = require('#models');

module.exports = {
  run: async () => {
    try {
      await Product.bulkCreate([
        {
          image: 'https://example.com/images/product1.jpg',
          name: 'Running Shoes',
          cost: 89.99,
          isNew: true,
          deliveryCost: 5.99,
          deliveryCity: 'Almaty',
          desc: 'Lightweight shoes for running.'
        },
        {
          image: 'https://example.com/images/product2.jpg',
          name: 'Jiu-Jitsu Mat',
          cost: 29.99,
          isNew: false,
          deliveryCost: 3.99,
          deliveryCity: 'Astana',
          desc: 'Comfortable mat for fighting sessions.'
        }
      ]);
      console.log('Products seeded');
    } catch (error) {
      console.error('Products seeder error:', error);
      throw error;
    }
  }
};
