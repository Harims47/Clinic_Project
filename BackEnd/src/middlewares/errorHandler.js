import logger from '../config/logger.js';

// Express global error handler middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error stacks to Winston
  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${err.stack || message}`);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    errors: err.errors || []
  });
};

export default errorHandler;
export { errorHandler };
