const AppError = require('./AppError');

/**
 * Validation Error (400)
 * Thrown when request validation fails
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = null) {
    super(message, 400);
    this.errors = errors;
  }
}

module.exports = ValidationError;
