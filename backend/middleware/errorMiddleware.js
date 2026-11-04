// 404 Route Not Found Handler
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  console.error(`[Error Handler] ${req.method} ${req.originalUrl} - Status ${statusCode}:`, err.message || err);

  // Handle Mongoose / MongoDB duplicate key error (code 11000)
  if (err.code === 11000 || err.errorResponse?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || err.errorResponse?.keyValue || {})[0] || 'Email';
    message = field === 'email' ? 'Email already registered' : `${field} already exists`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    const errors = Object.values(err.errors).map(val => val.message);
    message = errors.join(', ');
  }

  // Handle CastError (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier: ${err.value}`;
  }

  // Handle JSON parse error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { notFound, errorHandler };
