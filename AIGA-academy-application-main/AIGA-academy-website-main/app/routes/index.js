const express = require('express');
const router = express.Router();
const apiOptions = require('#configs/api');
const apiRoutes = require('#routes/api');
const webRoutes = require('#routes/web');
const accessTokenMiddleware = require('#policies/accessToken.policy');
const refreshTokenMiddleware = require('#policies/refreshToken.policy');
const bankRoutes = require('./api/v1/bankRoutes');
const chatRoutes = require('./api/v1/chatRoutes');
const lessonRoutes = require('./api/v1/lessonRoutes');
const clientRoutes = require('./api/v1/clientRoutes');
const productRoutes = require('./api/v1/productRoutes');
const scheduleRoutes = require('./api/v1/scheduleRoutes');
const mapRoutes = require('express-routes-mapper');

router.use('/bank', bankRoutes);
router.use('/chat', chatRoutes);
router.use('/lesson', lessonRoutes);
router.use('/client', clientRoutes);
router.use('/products', productRoutes);
router.use('/schedule', scheduleRoutes);

module.exports = function _setUpRoutes(options = {}) {
  try {
    const app = options?.app;

    apiOptions.versions.all.forEach(versionString => {
      app.all(`/api/${versionString}/private/*`, accessTokenMiddleware);
      app.use(`/api/${versionString}/auth/refresh`, refreshTokenMiddleware);
      app.use(`/api/${versionString}/auth/logout`, refreshTokenMiddleware);
      app.use(`/api/${versionString}`, mapRoutes(apiRoutes(versionString).public, 'app/controllers/api/'));
      app.use(`/api/${versionString}/private`, mapRoutes(apiRoutes(versionString).private, 'app/controllers/api/'));
    });

    app.use('/', mapRoutes(webRoutes.public, `app/controllers/web/`));
    return (req, res, next) => next();
  } catch (error) {
    const err = new Error(`Could not setup routes: ${error.message}`);
    err.name = error?.name;
    err.code = error?.code;
    throw err;
  }
};
