const { Achievement, User } = require('#models');

module.exports = {
  run: async () => {
    try {
      const user = await User.findOne(); // Предполагаем, что есть пользователь
      if (user) {
        await Achievement.bulkCreate([
          {
            clientId: user.id,
            title: 'Red belt',
            description: 'Completed red belt'
          },
          {
            clientId: user.id,
            title: '50 wins',
            description: 'Completed 50 wins in jiu-jitsu'
          }
        ]);
        console.log('Achievements seeded');
      }
    } catch (error) {
      console.error('Achievements seeder error:', error);
      throw error;
    }
  }
};
