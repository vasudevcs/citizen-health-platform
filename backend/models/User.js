const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const ROLES = ['citizen', 'doctor', 'ambassador', 'researcher', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'citizen', required: true, index: true },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // OTP (login / verification) - stored hashed, short TTL
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    otpPurpose: { type: String, enum: ['login', 'verify', 'reset'], select: false },
    otpAttempts: { type: Number, default: 0, select: false },

    // Refresh token rotation - store hash of current valid refresh token(s)
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },

    // Password reset
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },

    // Login security
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    lastLoginAt: { type: Date },

    // Doctor-specific profile (only populated for role === 'doctor')
    doctorProfile: {
      specialty: { type: String, trim: true },
      licenseNumber: { type: String, trim: true },
      bio: { type: String, maxlength: 1000 },
      availability: [
        {
          _id: false,
          day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], required: true },
          startTime: { type: String, required: true }, // 'HH:mm'
          endTime: { type: String, required: true },
        },
      ],
    },

    // Cross-role account preferences (Settings module)
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: true },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Generate a 6-digit OTP, return plaintext (to send) while storing hash
userSchema.methods.setOtp = function (purpose) {
  const otp = crypto.randomInt(100000, 999999).toString();
  this.otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  this.otpPurpose = purpose;
  this.otpAttempts = 0;
  return otp;
};

userSchema.methods.verifyOtp = function (candidate, purpose) {
  if (!this.otpHash || !this.otpExpiresAt) return false;
  if (this.otpExpiresAt < new Date()) return false;
  if (this.otpPurpose !== purpose) return false;
  const candidateHash = crypto.createHash('sha256').update(candidate).digest('hex');
  return candidateHash === this.otpHash;
};

userSchema.methods.clearOtp = function () {
  this.otpHash = undefined;
  this.otpExpiresAt = undefined;
  this.otpPurpose = undefined;
  this.otpAttempts = 0;
};

userSchema.methods.setResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  this.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  return token;
};

userSchema.methods.setRefreshToken = function (token) {
  this.refreshTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  this.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d
};

userSchema.methods.matchesRefreshToken = function (token) {
  if (!this.refreshTokenHash || !this.refreshTokenExpiresAt) return false;
  if (this.refreshTokenExpiresAt < new Date()) return false;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash === this.refreshTokenHash;
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isVerified: this.isVerified,
    preferences: this.preferences,
    ...(this.role === 'doctor' && this.doctorProfile ? { doctorProfile: this.doctorProfile } : {}),
  };
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
