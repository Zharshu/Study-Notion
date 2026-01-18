const { validationResult } = require('express-validator');
const { ValidationError } = require('../errors');

/**
 * Validation Middleware
 * Checks for validation errors from express-validator rules
 * Throws ValidationError if errors exist
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Collect all error messages
    const errorMessages = errors.array().map(err => err.msg);
    
    // Throw custom ValidationError (handled by global error middleware)
    throw new ValidationError(errorMessages.join('. '));
  }

  next();
};

module.exports = validate;
