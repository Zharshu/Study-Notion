/**
 * Custom Error Classes
 * Export all error types for easy importing
 */

const AppError = require('./AppError');
const ValidationError = require('./ValidationError');
const AuthenticationError = require('./AuthenticationError');
const AuthorizationError = require('./AuthorizationError');
const NotFoundError = require('./NotFoundError');

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError
};
