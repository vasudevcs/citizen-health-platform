const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies access token from Authorization header: "Bearer <token>"
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid token';
      return res.status(401).json({ success: false, message, code: 'TOKEN_INVALID' });
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User no longer active' });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireAuth;
