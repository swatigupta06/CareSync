/**
 * Global error handler — must be registered LAST in the Express app.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose: document not found
  if (err.name === 'CastError') {
    message = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  // Mongoose: duplicate key (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field '${field}'. Please use a different value.`;
    statusCode = 409;
  }

  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('. ');
    statusCode = 422;
  }

  // JWT errors (shouldn't reach here if auth middleware handles them,
  // but just in case)
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token.';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Token expired.';
    statusCode = 401;
  }

  // Multer file-size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = `File size exceeds the ${process.env.MAX_FILE_SIZE_MB || 10}MB limit.`;
    statusCode = 413;
  }

  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler — for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
