const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
} = require('../validations/settingsValidation');
const ctrl = require('../controllers/settingsController');

// Available to every authenticated role — not gated by requireRole.
router.use(requireAuth);

router.get('/profile', ctrl.getProfile);
router.patch('/profile', validate(updateProfileSchema), ctrl.updateProfile);
router.patch('/password', validate(changePasswordSchema), ctrl.changePassword);
router.patch('/preferences', validate(updatePreferencesSchema), ctrl.updatePreferences);

module.exports = router;
