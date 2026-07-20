const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { riskAssessmentSchema, bookAppointmentSchema } = require('../validations/citizenValidation');
const { createLabReportSchema } = require('../validations/uploadValidation');
const ctrl = require('../controllers/citizenController');

// All citizen routes require auth + citizen role
router.use(requireAuth, requireRole('citizen'));

// Dashboard aggregate
router.get('/dashboard', ctrl.getDashboard);

// Vitals
router.get('/vitals/:type', ctrl.getVitalHistory);
router.post('/vitals', ctrl.addVital);

// Medications
router.get('/medications', ctrl.getMedications);
router.post('/medications', ctrl.addMedication);
router.patch('/medications/:id/taken', ctrl.markMedicationTaken);

// Appointments
router.get('/appointments', ctrl.getAppointments);
router.post('/appointments', validate(bookAppointmentSchema), ctrl.bookAppointment);
router.get('/appointments/:id/chat', ctrl.getAppointmentChat);

// Lab reports
router.get('/lab-reports', ctrl.getLabReports);
router.post('/lab-reports', validate(createLabReportSchema), ctrl.createLabReport);

// Risk Assessment
router.post('/risk-assessment', validate(riskAssessmentSchema), ctrl.runRiskAssessment);
router.get('/risk-assessment/history', ctrl.getRiskAssessmentHistory);

module.exports = router;
