const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { chatSchema } = require('../validations/aiValidation');
const ctrl = require('../controllers/aiController');

router.use(requireAuth);

router.get('/status', ctrl.getStatus);
router.post('/chat', validate(chatSchema), ctrl.chat);
router.get('/risk-assessments/:id/explain', ctrl.explainRiskAssessment);

module.exports = router;
