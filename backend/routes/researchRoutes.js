const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const ctrl = require('../controllers/researchController');

router.use(requireAuth, requireRole('researcher'));

router.get('/overview', ctrl.getOverview);
router.get('/risk-distribution', ctrl.getRiskDistribution);
router.get('/demographics', ctrl.getDemographics);
router.get('/wellbeing-trend', ctrl.getWellbeingTrend);

module.exports = router;
