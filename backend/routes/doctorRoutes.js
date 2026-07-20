const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { prescriptionSchema, availabilitySchema } = require('../validations/doctorValidation');
const ctrl = require('../controllers/doctorController');

router.use(requireAuth, requireRole('doctor'));

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Appointments
router.get('/appointments', ctrl.getAppointments);
router.patch('/appointments/:id/confirm', ctrl.confirmAppointment);
router.patch('/appointments/:id/cancel', ctrl.cancelAppointment);
router.patch('/appointments/:id/complete', ctrl.completeAppointment);

// Patients
router.get('/patients', ctrl.getPatients);
router.get('/patients/:citizenId', ctrl.getPatientProfile);

// Prescriptions
router.get('/prescriptions', ctrl.getPrescriptions);
router.post('/prescriptions', validate(prescriptionSchema), ctrl.createPrescription);

// Availability
router.get('/availability', ctrl.getAvailability);
router.put('/availability', validate(availabilitySchema), ctrl.updateAvailability);

module.exports = router;
