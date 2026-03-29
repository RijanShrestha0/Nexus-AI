const errorHandler = (err, req, res, next) => {
  console.error('[System Error] Pipeline crash:', err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    error: err.message || 'The server encountered an unexpected autonomous execution error.',
    stack: process.env.NODE_ENV === 'production' ? '🔒' : err.stack,
  });
};

module.exports = { errorHandler };
