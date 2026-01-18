const AppError = require('./AppError');

/**
 * Authorization Error (403)
 * Thrown when user doesn't have permission
 */
class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
  }
}

module.exports = AuthorizationError;
