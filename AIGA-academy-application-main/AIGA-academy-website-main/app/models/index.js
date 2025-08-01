/*
 * Populate this file with models, that you want to migrate in db
 */
require('/User');
require('/DisabledRefreshToken');
require('/Transactions');
require('/Message');
require('/Lesson');
require('/Booking');
require('/CoachClient');
require('/Progress');
require('/Product');
require('/Achievement');

// Add your models here ..
models.forEach((model) => require(model));
