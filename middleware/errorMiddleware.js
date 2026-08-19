// Central error-handling middleware — must be registered last in app.js
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    status,
    message: err.isOperational ? err.message : (isProd ? 'Something went wrong' : err.message),
    // stack trace is never sent in production
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
