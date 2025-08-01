const { Progress, User } = require('#models');

module.exports = {
  run: async () => {
    try {
      const user = await User.findOne(); // Предполагаем, что есть хотя бы один пользователь
      if (user) {
        await Progress.bulkCreate([
          {
            clientId: user.id,
            metric: 'wins',
            value: 3,
            notes: 'First fighting practice'
          },
          {
            clientId: user.id,
            metric: 'body weight',
            value: 70,
            notes: 'Workout completed'
          }
        ]);
        console.log('Progress seeded');
      }
    } catch (error) {
      console.error('Progress seeder error:', error);
      throw error;
    }
  }
};
