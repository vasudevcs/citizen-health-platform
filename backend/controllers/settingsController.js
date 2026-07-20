const User = require('../models/User');

// ─────────────────────────────────────────────
// GET /settings/profile — current user's full safe profile
// ─────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /settings/profile — update name / email / phone
// ─────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    // Uniqueness checks — same rules registration enforces
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
    }
    if (phone) {
      const existing = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Phone number already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...(name && { name }), ...(email && { email }), ...(phone && { phone }) },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /settings/password — change password
// ─────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const matches = await user.comparePassword(currentPassword);
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.passwordHash = newPassword; // pre-save hook hashes this
    // Invalidate all existing sessions on password change — same
    // safeguard authController.resetPassword applies for the
    // forgot-password flow; Settings' change-password was missing it.
    user.refreshTokenHash = undefined;
    user.refreshTokenExpiresAt = undefined;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /settings/preferences — notification / theme preferences
// ─────────────────────────────────────────────
exports.updatePreferences = async (req, res, next) => {
  try {
    const updates = Object.fromEntries(Object.entries(req.body).map(([k, v]) => [`preferences.${k}`, v]));

    if (Object.keys(updates).length === 0) {
      const current = await User.findById(req.user.id).select('preferences');
      return res.json({ success: true, data: current.preferences });
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });
    res.json({ success: true, data: user.preferences });
  } catch (err) {
    next(err);
  }
};
