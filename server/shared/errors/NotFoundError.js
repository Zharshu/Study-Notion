const AppError = require('./AppError');

/**
 * Not Found Error (404)
 * Thrown when requested resource doesn't exist
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

module.exports = NotFoundError;
