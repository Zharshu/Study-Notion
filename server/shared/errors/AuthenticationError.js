const AppError = require('./AppError');

/**
 * Authentication Error (401)
 * Thrown when authentication fails
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

module.exports = AuthenticationError;
