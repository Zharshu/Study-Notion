const morgan = require('morgan');
const logger = require('../utils/logger');

// Override the stream method to redirect logs to Winston
const stream = {
  write: (message) => logger.http(message.trim()),
};

// Skip logic (can be customized)
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

// Build the morgan middleware
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = morganMiddleware;
