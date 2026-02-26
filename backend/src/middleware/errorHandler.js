// Error Handler Middleware - Structured logging + safe responses

const errorHandler = (err, req, res, next) => {
  // Structured error log for aggregation
  const errorLog = {
    level: 'error',
    msg: err.message,
    requestId: req.requestId || null,
    userId: req.user?.id || null,
    method: req.method,
    path: req.path,
    errorName: err.name,
    errorCode: err.code,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  };
  console.error(JSON.stringify(errorLog));

  // Don't send headers if already sent
  if (res.headersSent) return next(err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with this value already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
    });
  }

  // JSON parse errors (malformed request body)
  if (err.type === 'entity.parse.failed' || (err.name === 'SyntaxError' && err.status === 400)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // CORS errors
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({
      success: false,
      error: 'Origin not allowed',
    });
  }

  // Default error — never leak internals in production
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    requestId: req.requestId || undefined,
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
};

module.exports = { errorHandler, notFoundHandler };
