const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const ctrl = require('../controllers/adminController');

router.use(requireAuth, requireRole('admin'));

router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.listUsers);
router.patch('/users/:id/status', ctrl.setUserActive);
router.get('/community/flagged', ctrl.listFlaggedPosts);
router.patch('/community/:id/restore', ctrl.restorePost);
router.get('/reports/users.csv', ctrl.exportUsersCsv);

module.exports = router;
