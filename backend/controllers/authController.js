const crypto = require('crypto');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  refreshCookieOptions,
} = require('../utils/generateTokens');
const { sendOtpEmail, sendOtpSms, sendPasswordResetEmail } = require('../services/email');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function isEmail(identifier) {
  return /\S+@\S+\.\S+/.test(identifier);
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
async function register(req, res, next) {
  try {
    const { name, email, phone, password, role } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email or phone already registered' });
    }

    // doctor/ambassador/researcher/admin roles require separate approval flows;
    // self-registration here defaults anything non-citizen to unverified pending state
    const user = new User({
      name,
      email,
      phone,
      passwordHash: password, // hashed in pre-save hook
      role: role || 'citizen',
      isVerified: role === 'citizen', // citizens auto-verified; others verified via admin/OTP
    });

    const otp = user.setOtp('verify');
    await user.save();
    await sendOtpEmail(email, otp, 'verify');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your account with the OTP sent to your email.',
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/otp/send  { identifier, purpose }
// ---------------------------------------------------------------------------
async function sendOtp(req, res, next) {
  try {
    const { identifier, purpose } = req.body;
    const query = isEmail(identifier) ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query).select('+otpHash +otpExpiresAt');

    // Do not reveal whether account exists
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    }

    const otp = user.setOtp(purpose);
    await user.save();

    if (isEmail(identifier)) {
      await sendOtpEmail(user.email, otp, purpose);
    } else {
      await sendOtpSms(user.phone, otp);
    }

    res.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/otp/verify  { identifier, otp, purpose }
// For purpose=login -> issues tokens. For purpose=verify -> marks account verified.
// ---------------------------------------------------------------------------
async function verifyOtp(req, res, next) {
  try {
    const { identifier, otp, purpose } = req.body;
    const query = isEmail(identifier) ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query).select('+otpHash +otpExpiresAt +otpPurpose +otpAttempts');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
    }

    const valid = user.verifyOtp(otp, purpose);
    if (!valid) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.clearOtp();

    if (purpose === 'verify') {
      user.isVerified = true;
      await user.save();
      return res.json({ success: true, message: 'Account verified successfully.' });
    }

    if (purpose === 'login') {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken();
      user.setRefreshToken(refreshToken);
      user.lastLoginAt = new Date();
      await user.save();

      res.cookie('refreshToken', refreshToken, refreshCookieOptions());
      return res.json({ success: true, accessToken, user: user.toSafeJSON() });
    }

    // purpose === 'reset' handled by a distinct flow (issues reset token instead)
    const resetToken = user.setResetToken();
    await user.save();
    return res.json({ success: true, resetToken });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/login  { email, password }
// ---------------------------------------------------------------------------
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res
        .status(423)
        .json({ success: false, message: `Account locked. Try again in ${minutesLeft} minute(s).` });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your account first' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    user.setRefreshToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions());
    res.json({ success: true, accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/refresh-token
// Reads refresh token from httpOnly cookie, rotates it, issues new access token.
// ---------------------------------------------------------------------------
async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    // We can't look up by hash directly without knowing user id, so decode is not
    // possible (opaque token) - instead we require client to also know user via
    // access token claims at refresh time is not reliable post-expiry, so we
    // store token -> lookup via indexed hash field instead.
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ refreshTokenHash: tokenHash }).select(
      '+refreshTokenHash +refreshTokenExpiresAt'
    );

    if (!user || !user.matchesRefreshToken(token)) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    // Rotation: issue a brand new refresh token, invalidate the old one
    const newRefreshToken = generateRefreshToken();
    user.setRefreshToken(newRefreshToken);
    await user.save();

    const accessToken = generateAccessToken(user);
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions());
    res.json({ success: true, accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await User.updateOne(
        { refreshTokenHash: tokenHash },
        { $unset: { refreshTokenHash: '', refreshTokenExpiresAt: '' } }
      );
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password  { email }
// ---------------------------------------------------------------------------
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond success to avoid account enumeration
    if (user) {
      const resetToken = user.setResetToken();
      await user.save();
      await sendPasswordResetEmail(user.email, resetToken);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password  { token, password }
// ---------------------------------------------------------------------------
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
    }).select('+resetTokenHash +resetTokenExpiresAt');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.passwordHash = password; // re-hashed in pre-save hook
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    // Invalidate all existing sessions on password change
    user.refreshTokenHash = undefined;
    user.refreshTokenExpiresAt = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  sendOtp,
  verifyOtp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
