function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ success: false, message: `${field} already in use` });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Malformed ObjectId in a route param (e.g. GET /api/community/posts/xyz)
  // — a client input error, not a server fault. Without this it fell
  // through to the generic 500 branch below on every :id route in the API.
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path || 'id'}` });
  }

  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message;

  res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
