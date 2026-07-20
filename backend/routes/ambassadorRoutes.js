const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { addNoteSchema } = require('../validations/ambassadorValidation');
const ctrl = require('../controllers/ambassadorController');

router.use(requireAuth, requireRole('ambassador'));

router.get('/citizens', ctrl.listCitizens);
router.get('/citizens/:id', ctrl.getCitizen);
router.get('/citizens/:id/notes', ctrl.listNotesForCitizen);
router.post('/notes', validate(addNoteSchema), ctrl.addNote);
router.get('/stats', ctrl.getMyStats);
router.get('/activity', ctrl.getMyActivity);

module.exports = router;
