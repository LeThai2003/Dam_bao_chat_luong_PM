const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // log ra terminal
    new winston.transports.File({ filename: path.join(__dirname, 'test-log.txt') }) // log ra file
  ]
});

module.exports = logger;