const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { moodEntrySchema } = require('../validations/wellbeingValidation');
const ctrl = require('../controllers/wellbeingController');

// All wellbeing routes require auth + citizen role (mirrors citizenRoutes)
router.use(requireAuth, requireRole('citizen'));

router.get('/mood', ctrl.getMoodHistory);
router.post('/mood', validate(moodEntrySchema), ctrl.addMoodEntry);
router.get('/summary', ctrl.getSummary);
router.get('/resources', ctrl.getResources);

module.exports = router;
