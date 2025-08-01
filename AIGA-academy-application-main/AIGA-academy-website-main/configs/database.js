const url = require('url');
const CHARSET = 'utf8';
const COLLATE = 'utf8_general_ci';

let dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ?? '3306',
  dialect: process.env.DB_DIALECT ?? 'mysql'
};

if (process.env.DATABASE_URL) {
  const parsed = url.parse(process.env.DATABASE_URL);
  dbConfig = {
    database: parsed.pathname?.split('/')[1],
    username: parsed.auth?.split(':')[0],
    password: parsed.auth?.split(':')[1],
    host: parsed.hostname,
    port: parsed.port,
    dialect: parsed.protocol.replace(':', '')
  };
}

const requiredEnv = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
const missing = requiredEnv.filter((key) => !process.env[key] && !process.env.DATABASE_URL);
if (missing.length > 0) {
  throw new Error(`Missing required database environment variables: ${missing.join(', ')}`);
}

const allowedDialects = ['mysql', 'postgres'];
if (!allowedDialects.includes(dbConfig.dialect)) {
  throw new Error(`Invalid DB_DIALECT: "${dbConfig.dialect}". Allowed: ${allowedDialects.join(', ')}`);
}

module.exports = {
  ...dbConfig,
  pool: { max: 5, min: 0, idle: 10000 },
  charset: CHARSET,
  collate: COLLATE,
  timestamps: true,
  logging: false
};
