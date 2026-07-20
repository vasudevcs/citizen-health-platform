const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const {
  loginLimiter,
  otpRequestLimiter,
  registerLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimiter');

const {
  registerSchema,
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validations/authValidation');

const authController = require('../controllers/authController');

router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/otp/send', otpRequestLimiter, validate(otpSendSchema), authController.sendOtp);
router.post('/otp/verify', loginLimiter, validate(otpVerifySchema), authController.verifyOtp);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
