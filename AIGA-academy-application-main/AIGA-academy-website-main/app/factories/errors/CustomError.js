class CustomError extends Error {
  constructor(message = 'Internal Server Error', status = 500, code = null) {
    super(message);
    this.name = this.constructor.name;
    this.status = status; // HTTP статус
    this.code = code ?? status; // бизнес-код, можно отдельно
    Error.captureStackTrace(this, this.constructor);
  }

  // Клонирование ошибки
  replicate(originalError) {
    this.name = originalError?.name ?? this.name;
    this.code = originalError?.code ?? this.code;
    this.status = originalError?.status ?? this.status;

    const messageLines = (this.message.match(/\n/g) || []).length + 1;
    this.stack =
      this.stack.split('\n').slice(0, messageLines + 1).join('\n') +
      '\n' +
      originalError.stack;
  }
}

class ValidationError extends CustomError {
  constructor(message = 'Validation failed', code = 400) {
    super(message, 400, code);
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized', code = 401) {
    super(message, 401, code);
  }
}

module.exports = {
  CustomError,
  ValidationError,
  UnauthorizedError
};
