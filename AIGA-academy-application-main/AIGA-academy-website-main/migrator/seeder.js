// Import config from .env file.
require('dotenv').config();

// Data to seed:
const users = require('./seeds/users');
const products = require('./seeds/Products');
const progress = require('./seeds/Progress');
const achievements = require('./seeds/Achievements');
const transactions = require('./seeds/Transactions');

// Connection to database.
const db = require('#services/db.service');

async function _main() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const error = new Error('Can not make any actions in non-dev env.');
      throw error;
    }

    // Make database connection active.
    const DB = await db.service(process.env.NODE_ENV).start();

    // Run all seeders
    await users.run();          // Seed users
    await products.run();       // Seed products
    await progress.run();       // Seed progress data
    await achievements.run();   // Seed achievements
    await transactions.run();   // Seed transactions

    console.warn('All seeds inserted');
    process.exit(0);
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
}

// Start.
_main();
