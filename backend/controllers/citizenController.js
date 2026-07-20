const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const HealthVital = require('../models/HealthVital');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const LabReport = require('../models/LabReport');
const Notification = require('../models/Notification');
const RiskAssessment = require('../models/RiskAssessment');
const User = require('../models/User');
const { getLatestVitalsMap } = require('../utils/vitals');
const { notifyRole } = require('../utils/notify');
const riskEngine = require('../services/riskEngine');

// ─────────────────────────────────────────────
// Helper: compute health score from latest vitals
// ─────────────────────────────────────────────
function computeHealthScore(latestVitals) {
  let score = 100;
  let deductions = 0;

  const bp = latestVitals.blood_pressure;
  if (bp) {
    const systolic = bp.value.primary;
    const diastolic = bp.value.secondary;
    if (systolic > 140 || diastolic > 90) deductions += 15;
    else if (systolic > 130 || diastolic > 85) deductions += 8;
    else if (systolic < 90 || diastolic < 60) deductions += 10;
  } else {
    deductions += 5; // unknown
  }

  const bs = latestVitals.blood_sugar;
  if (bs) {
    if (bs.value.primary > 200) deductions += 15;
    else if (bs.value.primary > 126) deductions += 10;
    else if (bs.value.primary < 70) deductions += 12;
  } else {
    deductions += 5;
  }

  const bmi = latestVitals.bmi;
  if (bmi) {
    const b = bmi.value.primary;
    if (b < 18.5 || b >= 30) deductions += 10;
    else if (b >= 25) deductions += 5;
  } else {
    deductions += 3;
  }

  const hr = latestVitals.heart_rate;
  if (hr) {
    if (hr.value.primary > 100 || hr.value.primary < 50) deductions += 8;
  } else {
    deductions += 3;
  }

  const spo2 = latestVitals.oxygen_saturation;
  if (spo2) {
    if (spo2.value.primary < 90) deductions += 20;
    else if (spo2.value.primary < 95) deductions += 10;
  } else {
    deductions += 3;
  }

  return Math.max(0, Math.min(100, score - deductions));
}

function scoreCategory(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

// ─────────────────────────────────────────────
// GET /api/citizens/dashboard
// ─────────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 3600 * 1000);

    // Fetch latest vital per type
    const vitalTypes = [
      'blood_pressure',
      'blood_sugar',
      'bmi',
      'heart_rate',
      'weight',
      'oxygen_saturation',
      'sleep',
      'activity',
    ];

    const latestVitals = await getLatestVitalsMap(citizenId, vitalTypes);

    // Fetch 30-day trend for BP and blood sugar (for charts)
    const [bpTrend, bsTrend, hrTrend, weightTrend] = await Promise.all([
      HealthVital.find({ citizen: citizenId, type: 'blood_pressure', recordedAt: { $gte: thirtyDaysAgo } })
        .sort({ recordedAt: 1 })
        .select('value recordedAt')
        .lean(),
      HealthVital.find({ citizen: citizenId, type: 'blood_sugar', recordedAt: { $gte: thirtyDaysAgo } })
        .sort({ recordedAt: 1 })
        .select('value recordedAt')
        .lean(),
      HealthVital.find({ citizen: citizenId, type: 'heart_rate', recordedAt: { $gte: thirtyDaysAgo } })
        .sort({ recordedAt: 1 })
        .select('value recordedAt')
        .lean(),
      HealthVital.find({ citizen: citizenId, type: 'weight', recordedAt: { $gte: thirtyDaysAgo } })
        .sort({ recordedAt: 1 })
        .select('value recordedAt')
        .lean(),
    ]);

    // Upcoming appointments (next 7 days)
    const upcomingAppointments = await Appointment.find({
      citizen: citizenId,
      scheduledAt: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 3600 * 1000) },
      status: { $in: ['pending', 'confirmed'] },
    })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .lean();

    // Active medications
    const medications = await Medication.find({
      citizen: citizenId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Recent lab reports
    const recentLabReports = await LabReport.find({ citizen: citizenId })
      .sort({ conductedAt: -1 })
      .limit(5)
      .select('title lab conductedAt results fileUrl')
      .lean();

    // Recent notifications
    const notifications = await Notification.find({ user: citizenId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Health score
    const healthScore = computeHealthScore(latestVitals);
    const category = scoreCategory(healthScore);

    res.json({
      success: true,
      data: {
        healthScore: { score: healthScore, category },
        vitals: latestVitals,
        trends: {
          bloodPressure: bpTrend,
          bloodSugar: bsTrend,
          heartRate: hrTrend,
          weight: weightTrend,
        },
        upcomingAppointments,
        medications,
        recentLabReports,
        notifications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/citizens/vitals/:type?days=30
// ─────────────────────────────────────────────
exports.getVitalHistory = async (req, res, next) => {
  try {
    const { type } = req.params;
    const days = Math.min(parseInt(req.query.days) || 30, 365);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);

    const records = await HealthVital.find({
      citizen: req.user.id,
      type,
      recordedAt: { $gte: since },
    })
      .sort({ recordedAt: 1 })
      .lean();

    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/citizens/vitals
// ─────────────────────────────────────────────
exports.addVital = async (req, res, next) => {
  try {
    const { type, value, unit, notes, recordedAt } = req.body;
    const vital = await HealthVital.create({
      citizen: req.user.id,
      type,
      value,
      unit,
      notes,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    });
    res.status(201).json({ success: true, data: vital });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/citizens/medications
// ─────────────────────────────────────────────
exports.getMedications = async (req, res, next) => {
  try {
    const meds = await Medication.find({
      citizen: req.user.id,
      isActive: true,
    }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: meds });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/citizens/medications
// ─────────────────────────────────────────────
exports.addMedication = async (req, res, next) => {
  try {
    const med = await Medication.create({
      citizen: req.user.id,
      ...req.body,
    });
    res.status(201).json({ success: true, data: med });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/citizens/medications/:id/taken
// ─────────────────────────────────────────────
exports.markMedicationTaken = async (req, res, next) => {
  try {
    const med = await Medication.findOne({ _id: req.params.id, citizen: req.user.id });
    if (!med) return res.status(404).json({ success: false, message: 'Medication not found' });

    med.takenDates.push(new Date());
    await med.save();
    res.json({ success: true, data: med });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/citizens/appointments
// ─────────────────────────────────────────────
exports.getAppointments = async (req, res, next) => {
  try {
    const upcoming = req.query.upcoming === 'true';
    const query = { citizen: req.user.id };
    if (upcoming) {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    }
    const appointments = await Appointment.find(query)
      .sort({ scheduledAt: upcoming ? 1 : -1 })
      .limit(20)
      .lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/citizens/lab-reports
// ─────────────────────────────────────────────
exports.getLabReports = async (req, res, next) => {
  try {
    const reports = await LabReport.find({ citizen: req.user.id })
      .sort({ conductedAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

// Maps validated MIME types to a safe extension — never trust the client's
// declared file name for this (path traversal / double-extension risk).
const EXTENSION_BY_MIME = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// ─────────────────────────────────────────────
// POST /api/citizens/lab-reports — create a report, optionally with an
// uploaded scan (base64-encoded — see uploadValidation.js for why not
// multipart).
// ─────────────────────────────────────────────
exports.createLabReport = async (req, res, next) => {
  try {
    const { title, lab, conductedAt, notes, isSharedWithDoctor, file } = req.body;
    const citizenId = req.user.id;

    let fileUrl;
    let filePublicId;

    if (file) {
      const buffer = Buffer.from(file.fileData, 'base64');
      const ext = EXTENSION_BY_MIME[file.fileType];
      const safeFileName = `${crypto.randomUUID()}${ext}`;
      const citizenDir = path.join(__dirname, '..', 'uploads', 'lab-reports', citizenId);
      fs.mkdirSync(citizenDir, { recursive: true });
      fs.writeFileSync(path.join(citizenDir, safeFileName), buffer);

      filePublicId = `lab-reports/${citizenId}/${safeFileName}`;
      fileUrl = `/uploads/${filePublicId}`;
    }

    const report = await LabReport.create({
      citizen: citizenId,
      title,
      lab,
      conductedAt,
      notes,
      isSharedWithDoctor,
      fileUrl,
      filePublicId,
      results: [],
    });

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/citizens/risk-assessment
// Body validated by riskAssessmentSchema (age, gender, smoker, familyHistory)
// ─────────────────────────────────────────────
exports.runRiskAssessment = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const profile = req.body; // already validated + typed by validate() middleware

    const latestVitals = await getLatestVitalsMap(citizenId);
    const input = riskEngine.buildInput(latestVitals, profile);
    const { provider, conditions } = riskEngine.assess(input);

    const assessment = await RiskAssessment.create({
      citizen: citizenId,
      engineVersion: provider,
      profile,
      vitalsSnapshot: latestVitals,
      conditions,
    });

    res.status(201).json({
      success: true,
      data: {
        id: assessment._id,
        engineVersion: assessment.engineVersion,
        conditions: assessment.conditions,
        hasVitalsData: input.hasVitalsData,
        createdAt: assessment.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/citizens/risk-assessment/history?limit=10
// Returns past assessments, most recent first, for trend charts
// ─────────────────────────────────────────────
exports.getRiskAssessmentHistory = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const history = await RiskAssessment.find({ citizen: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('conditions engineVersion createdAt')
      .lean();
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/citizens/appointments
// Self-service booking. Doctor assignment/confirmation happens from the
// Doctor Portal (future module) — starts life as 'pending'.
// ─────────────────────────────────────────────
exports.bookAppointment = async (req, res, next) => {
  try {
    const { type, scheduledAt, durationMinutes, doctorSpecialty, notes } = req.body;

    const appointment = await Appointment.create({
      citizen: req.user.id,
      type,
      scheduledAt,
      durationMinutes,
      doctorSpecialty,
      notes,
      status: 'pending',
      meetingLink: type === 'telemedicine' ? undefined : undefined, // room id = appointment._id, no link needed
    });

    notifyRole(User, 'doctor', {
      title: 'New appointment request',
      message: `A ${type.replace('_', ' ')} request was booked for ${new Date(scheduledAt).toLocaleString()}${doctorSpecialty ? ` (${doctorSpecialty})` : ''}.`,
      type: 'appointment',
      link: '/doctor/appointments',
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/citizens/appointments/:id/chat
// Returns chat history for a telemedicine session (also used on rejoin)
// ─────────────────────────────────────────────
exports.getAppointmentChat = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      citizen: req.user.id,
    })
      .select('chatMessages type status')
      .lean();

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment.chatMessages || [] });
  } catch (err) {
    next(err);
  }
};
