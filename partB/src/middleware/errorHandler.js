/**
 * Global error handler middleware
 * Express-ийн 4 аргумент бүхий error handler
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Серверийн алдаа',
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * 404 handler — route олдоогүй
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: `Route олдсонгүй: ${req.method} ${req.path}`,
  });
}

module.exports = { errorHandler, notFound };
