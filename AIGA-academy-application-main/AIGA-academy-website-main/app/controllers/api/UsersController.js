const usersFacade = require('#facades/users');
const jwtFacade = require('#facades/jwt.facade');
const JWT = require('#services/jwt.service');
const { createOKResponse, createErrorResponse } = require('#factories/responses/api');
const { Err } = require('#factories/errors');

module.exports = UsersController;

function UsersController() {
  const _processError = (error, req, res) => {
    let errorMessage = error?.message ?? 'Internal server error';
    let statusCode = 500;

    switch (error.name) {
      case 'Unauthorized':
        errorMessage = 'Email or password are incorrect.';
        statusCode = 406;
        break;
      case 'ValidationError':
        errorMessage = 'Invalid email OR password input';
        statusCode = 401;
        break;
      case 'InvalidToken':
        errorMessage = 'Invalid token or token expired';
        statusCode = 401;
        break;
      case 'UserNotFound':
        errorMessage = "Such user doesn't exist";
        statusCode = 400;
        break;
      default:
        break;
    }

    return createErrorResponse({
      res,
      error: { message: errorMessage },
      status: statusCode,
    });
  };

  const _register = async (req, res) => {
    try {
      const email = req.body?.email?.trim();
      const password = req.body?.password;
      const firstName = req.body?.firstName?.trim();
      const lastName = req.body?.lastName?.trim();
      const role = req.body?.role?.toLowerCase();

      const allowedRoles = ['client', 'coach', 'parent'];

      if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !password ||
        password.length < 6 ||
        !firstName ||
        firstName.length < 2 ||
        !lastName ||
        lastName.length < 2 ||
        !allowedRoles.includes(role)
      ) {
        const err = new Err('Invalid input: check email, password, firstName, lastName, and role');
        err.name = 'ValidationError';
        throw err;
      }

      const [tokens, user] = await usersFacade.register({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      return createOKResponse({
        res,
        content: {
          tokens,
          user: user.toJSON(),
        },
      });
    } catch (error) {
      console.error('UsersController._register error: ', error);
      return _processError(error, req, res);
    }
  };

  const _login = async (req, res) => {
    try {
      const email = req.body?.email;
      const password = req.body?.password;

      if (!email || !password) {
        const err = new Error('Invalid email OR password input');
        err.name = 'ValidationError';
        throw err;
      }

      const [tokens, user] = await usersFacade.login({ email, password });

      return createOKResponse({
        res,
        content: {
          tokens,
          user: user.toJSON(),
        },
      });
    } catch (error) {
      console.error('UsersController._login error: ', error);
      return _processError(error, req, res);
    }
  };

  const _validate = async (req, res) => {
    try {
      const { token } = req.body;

      await JWT.verifyAccessToken(token);

      return createOKResponse({
        res,
        content: {
          isValid: true,
          message: 'Valid Token',
        },
      });
    } catch (error) {
      console.error('UsersController._validate error: ', error);
      const err = new Error('Invalid Token!');
      err.name = 'InvalidToken';
      return _processError(err, req, res);
    }
  };

  const _refresh = async (req, res) => {
    try {
      const refreshToken = req?.refreshToken;
      if (!refreshToken) {
        const err = new Err('No refreshToken found');
        err.name = 'Unauthorized';
        err.status = 401;
        throw err;
      }

      const [accessToken] = await jwtFacade.refreshAccessToken({ refreshToken });

      return createOKResponse({
        res,
        content: { token: accessToken },
      });
    } catch (error) {
      console.error('UsersController._refresh error: ', error);
      const err = new Error('Invalid Token!');
      err.name = 'InvalidToken';
      return _processError(err, req, res);
    }
  };

  const _logout = async (req, res) => {
    try {
      const refreshToken = req?.refreshToken;
      if (!refreshToken) {
        const err = new Err('No refreshToken found');
        err.name = 'Unauthorized';
        err.status = 401;
        throw err;
      }

      const [status] = await jwtFacade.disableRefreshToken({ refreshToken });

      return createOKResponse({
        res,
        content: {
          status,
          loggedIn: status === true,
        },
      });
    } catch (error) {
      console.error('UsersController._logout error: ', error);
      const err = new Error('Invalid Token!');
      err.name = 'InvalidToken';
      return _processError(err, req, res);
    }
  };

  const _getFullName = async (req, res) => {
    try {
      const userId = req?.token?.id;

      const [fullName] = await usersFacade.getFullName({ userId });

      return createOKResponse({
        res,
        content: { fullName },
      });
    } catch (error) {
      console.error('UsersController._getFullName error: ', error);
      return _processError(error, req, res);
    }
  };

  return {
    register: _register,
    login: _login,
    validate: _validate,
    refresh: _refresh,
    logout: _logout,
    getFullName: _getFullName,
  };
}
