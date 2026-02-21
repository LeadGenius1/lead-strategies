// Structured Request Logger Middleware
// JSON format for log aggregation (Railway, Datadog, etc.)

const crypto = require('crypto');

// Generate short request ID
function reqId() {
  return crypto.randomBytes(6).toString('hex');
}

const logger = (req, res, next) => {
  const start = Date.now();
  req.requestId = req.headers['x-request-id'] || reqId();

  // Attach request ID to response headers for tracing
  res.setHeader('X-Request-Id', req.requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      msg: `${req.method} ${req.path} ${res.statusCode} ${duration}ms`,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      requestId: req.requestId,
      userId: req.user?.id || null,
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 100),
      timestamp: new Date().toISOString(),
    };

    // Skip noisy health check logs
    if (req.path === '/health' || req.path === '/api/health' || req.path === '/api/v1/health') {
      if (res.statusCode < 400) return;
    }

    if (res.statusCode >= 500) {
      console.error(JSON.stringify(log));
    } else if (res.statusCode >= 400) {
      console.warn(JSON.stringify(log));
    } else {
      console.log(JSON.stringify(log));
    }
  });

  next();
};

module.exports = { requestLogger: logger };
