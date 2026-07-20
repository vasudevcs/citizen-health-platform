const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { progressUpdateSchema } = require('../validations/educationValidation');
const ctrl = require('../controllers/educationController');

router.use(requireAuth, requireRole('citizen'));

router.get('/content', ctrl.listContent);
router.get('/content/:id', ctrl.getContent);
router.get('/progress', ctrl.getProgress);
router.patch('/content/:id/progress', validate(progressUpdateSchema), ctrl.updateProgress);

module.exports = router;
