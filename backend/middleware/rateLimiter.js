const rateLimit = require('express-rate-limit');

// Strict limiter for login/OTP - prevents credential stuffing & OTP brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  keyGenerator: (req) => `${req.ip}:${req.body?.email || req.body?.identifier || ''}`,
});

const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait before requesting again.',
  },
  keyGenerator: (req) => `${req.ip}:${req.body?.identifier || ''}`,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many accounts created from this IP. Try later.' },
});

const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset requests. Try later.' },
});

module.exports = { loginLimiter, otpRequestLimiter, registerLimiter, passwordResetLimiter };
