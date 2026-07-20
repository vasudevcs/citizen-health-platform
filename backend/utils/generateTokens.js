const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, tv: user.tokenVersion || 0 },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

// Refresh token is a random opaque string (not JWT) - safer against JWT-forging
// if the access secret ever leaks. We store its hash on the user document.
function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

function refreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: '/api/auth',
  };
}
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshCookieOptions,
  REFRESH_TOKEN_TTL_MS,
};
