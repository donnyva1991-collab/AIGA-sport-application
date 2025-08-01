require('dotenv').config();
const db = require('#services/db.service');
const users = require('./seeds/users');
const products = require('./seeds/Product');
const progress = require('./seeds/Progress');
const achievements = require('./seeds/Achievements');
const transactions = require('./seeds/Transactions');
require('./models');

async function _main() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Can only migrate and seed in development environment.');
    }

    const DB = await db.service(process.env.NODE_ENV).start();
    await db.migrate(process.env.NODE_ENV, true);

    await users.run();
    await products.run();
    await progress.run();
    await achievements.run();
    await transactions.run();

    console.info('All models migrated and seeded.');
    process.exit(0);
  } catch (error) {
    console.error('Migrator error:', error);
    process.exit(1);
  }
}

_main();
