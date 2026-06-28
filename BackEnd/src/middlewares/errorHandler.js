import logger from '../config/logger.js';

// Express global error handler middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Map database constraints and validation errors to user-friendly messages
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Conflict: A record with this unique value already exists.';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Relational Constraint Violation: The requested operation violates relational constraints (e.g. referencing an invalid record, or deleting a referenced record).';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation failed at database level.';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  // Log error stacks to Winston
  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${err.stack || message}`);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    errors
  });
};

export default errorHandler;
export { errorHandler };
