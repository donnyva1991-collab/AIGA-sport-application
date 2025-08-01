/**
 * Main application file.
 * This file initializes the Express server, sets up middleware, connects to the database,
 * and handles graceful shutdown.
 */

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { initSocket } = require('#services/socket.service');
const environments = require('#configs/environments');
const DB = require('#services/db.service');
const serverConfig = require('#configs/server');
const routes = require('#routes/');

// Инициализация Express приложения и HTTP сервера
const app = express();
const server = http.Server(app);

// Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'] }));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static('public'));

// Настройка безопасности с Helmet
app.use(helmet({
  dnsPrefetchControl: { allow: false }, // Предотвращение DNS prefetching для приватности
  frameguard: { action: 'deny' }, // Запрет использования в iframe для защиты от clickjacking
  ieNoOpen: true, // Предотвращение открытия неподтверждённых файлов в IE
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", ...(process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'])],
      imgSrc: ["'self'", 'data:'],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Ограничение referrer
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // HSTS для HTTPS
  xssFilter: true, // Фильтр XSS для старых браузеров
}));

// Парсинг тел запросов
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Настройка маршрутов
app.use(routes({ app }));

// Глобальная ссылка на подключение к базе данных
let dbConnection;

// Асинхронная инициализация перед запуском
async function _beforeStart() {
  try {
    // Проверка допустимой среды
    if (!environments.allowed.includes(environments.current)) {
      throw new Error(`NODE_ENV is set to ${environments.current}, but only ${environments.allowed.join(', ')} are valid.`);
    }

    // Инициализация и запуск базы данных
    dbConnection = await DB.service(environments.current);
    await dbConnection.start();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    throw error;
  }
}

// Graceful shutdown
function _gracefulShutdown(signal = 'SIGTERM') {
  console.warn(`Received ${signal}. Shutting down gracefully...`);
  const exitCode = 1;

  // Закрытие сокет-соединений
  initSocket(server).close(() => console.log('Socket connections closed'));

  // Закрытие сервера
  server.close(() => {
    console.info('HTTP server closed');
    if (dbConnection) {
      dbConnection.stop().then(() => {
        console.info('Database connection closed');
        process.exit(exitCode);
      }).catch(err => {
        console.error('Error closing database:', err);
        process.exit(exitCode);
      });
    } else {
      process.exit(exitCode);
    }
  });

  // Принудительное завершение через 5 секунд
  setTimeout(() => {
    console.warn('Could not close connections in time, forcing shutdown');
    process.exit(exitCode);
  }, 5000);
}

// Обработка сигналов завершения
process.on('SIGTERM', _gracefulShutdown);
process.on('SIGINT', _gracefulShutdown); // Например, Ctrl+C
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  _gracefulShutdown('Unhandled Rejection');
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  _gracefulShutdown('Uncaught Exception');
});

// Запуск приложения
async function startServer() {
  try {
    await _beforeStart();
    const port = process.env.PORT || serverConfig.port || 3000;
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    // Инициализация сокетов после успешного старта
    initSocket(server);
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
}

startServer();
