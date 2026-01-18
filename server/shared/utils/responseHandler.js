/**
 * Standard Response Handler Utilities
 * Provides consistent API response format across all endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object|Array|null} data - Response data
 * @returns {Object} JSON response
 */
exports.successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object|null} errors - Validation errors or additional error details
 * @returns {Object} JSON response
 */
exports.errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination details
 * @returns {Object} JSON response
 */
exports.paginatedResponse = (res, statusCode, message, data, pagination) => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(pagination.page),
      limit: parseInt(pagination.limit),
      total: pagination.total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Send created response (201)
 */
exports.createdResponse = (res, message, data = null) => {
  return exports.successResponse(res, 201, message, data);
};

/**
 * Send no content response (204)
 */
exports.noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Send bad request response (400)
 */
exports.badRequestResponse = (res, message, errors = null) => {
  return exports.errorResponse(res, 400, message, errors);
};

/**
 * Send unauthorized response (401)
 */
exports.unauthorizedResponse = (res, message = 'Unauthorized') => {
  return exports.errorResponse(res, 401, message);
};

/**
 * Send forbidden response (403)
 */
exports.forbiddenResponse = (res, message = 'Forbidden - You do not have permission to access this resource') => {
  return exports.errorResponse(res, 403, message);
};

/**
 * Send not found response (404)
 */
exports.notFoundResponse = (res, message = 'Resource not found') => {
  return exports.errorResponse(res, 404, message);
};

/**
 * Send conflict response (409)
 */
exports.conflictResponse = (res, message = 'Resource already exists') => {
  return exports.errorResponse(res, 409, message);
};

/**
 * Send internal server error response (500)
 */
exports.serverErrorResponse = (res, message = 'Internal server error') => {
  return exports.errorResponse(res, 500, message);
};
