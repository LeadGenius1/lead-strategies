// Request Logger Middleware

const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 400) {
      console.error('[REQUEST]', JSON.stringify(log));
    } else {
      console.log('[REQUEST]', JSON.stringify(log));
    }
  });

  next();
};

module.exports = { requestLogger: logger };
