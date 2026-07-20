const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(requireAuth);

router.get('/me', ctrl.getMyNotifications);
router.put('/mark-all-read', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markOneRead);

module.exports = router;
