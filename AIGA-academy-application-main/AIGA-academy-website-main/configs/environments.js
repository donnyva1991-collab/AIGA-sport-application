require('dotenv').config();

module.exports = {
	current: process.env.NODE_ENV,
	allowed: [
		'development',
		'testing',
		'staging',
		'production'
	]
}
const requiredEnvs = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

requiredEnvs.forEach(name => {
  if (!process.env[name]) {
    console.error(`[ENV ERROR] Missing required variable: ${name}`);
    process.exit(1); // Остановка приложения
  }
});
