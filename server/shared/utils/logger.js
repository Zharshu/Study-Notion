const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// Define colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define custom format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define file format (no colors, pure JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: format,
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../../logs/error.log'),
      level: 'error',
      format: fileFormat,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../../logs/combined.log'),
      format: fileFormat,
    }),
  ],
});

// Create logs directory if it doesn't exist
// Note: Winston usually creates files but not deep directories. 
// We'll rely on FS for directory creation if needed, or assume 'logs' folder at root.

module.exports = logger;
