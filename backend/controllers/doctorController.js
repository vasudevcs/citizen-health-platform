const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Medication = require('../models/Medication');
const LabReport = require('../models/LabReport');
const HealthVital = require('../models/HealthVital');
const { getLatestVitalsMap } = require('../utils/vitals');
const { notifyUser } = require('../utils/notify');

// ─────────────────────────────────────────────
// Permission helper: a doctor may only view a citizen's records if there is
// at least one appointment linking them (i.e. the doctor has accepted a
// request from this patient at some point). Mirrors the "existing
// permissions" model already implied by Appointment.doctor.
// ─────────────────────────────────────────────
async function assertDoctorHasPatient(doctorId, citizenId) {
  const link = await Appointment.exists({ doctor: doctorId, citizen: citizenId });
  return !!link;
}

// ─────────────────────────────────────────────
// GET /api/doctors/dashboard
// ─────────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

    const [todayAppointments, pendingPool, weekAppointments, patientIds, recentCompleted] = await Promise.all([
      Appointment.find({ doctor: doctorId, scheduledAt: { $gte: startOfDay, $lte: endOfDay } })
        .sort({ scheduledAt: 1 })
        .lean(),
      Appointment.countDocuments({ doctor: null, status: 'pending' }),
      Appointment.countDocuments({ doctor: doctorId, scheduledAt: { $gte: startOfWeek, $lte: endOfDay } }),
      Appointment.distinct('citizen', { doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
    ]);

    res.json({
      success: true,
      data: {
        todayAppointments,
        stats: {
          todayCount: todayAppointments.length,
          pendingRequestsInPool: pendingPool,
          weekCount: weekAppointments,
          totalPatients: patientIds.length,
          completedConsultations: recentCompleted,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/doctors/appointments?status=pending|confirmed|completed|cancelled
// 'pending' with no assigned doctor yet shows the open request pool;
// all other statuses are scoped to this doctor's own appointments.
// ─────────────────────────────────────────────
exports.getAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const doctorId = req.user.id;

    let query;
    if (status === 'pending') {
      query = { status: 'pending', $or: [{ doctor: null }, { doctor: doctorId }] };
    } else if (status) {
      query = { doctor: doctorId, status };
    } else {
      query = { $or: [{ doctor: doctorId }, { doctor: null, status: 'pending' }] };
    }

    const appointments = await Appointment.find(query)
      .sort({ scheduledAt: 1 })
      .populate('citizen', 'name email phone')
      .lean();

    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/doctors/appointments/:id/confirm
// Claims an unassigned pending request (or reconfirms one's own).
// ─────────────────────────────────────────────
exports.confirmAppointment = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user.id).select('name doctorProfile');
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      status: 'pending',
      $or: [{ doctor: null }, { doctor: req.user.id }],
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Pending appointment not found or already claimed' });
    }

    appointment.doctor = req.user.id;
    appointment.doctorName = doctor.name;
    appointment.doctorSpecialty = appointment.doctorSpecialty || doctor.doctorProfile?.specialty;
    appointment.status = 'confirmed';
    await appointment.save();

    notifyUser({
      userId: appointment.citizen,
      title: 'Appointment confirmed',
      message: `Dr. ${doctor.name} confirmed your ${appointment.type.replace('_', ' ')} appointment for ${new Date(appointment.scheduledAt).toLocaleString()}.`,
      type: 'appointment',
      link: '/telemedicine',
    });

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/doctors/appointments/:id/cancel
// ─────────────────────────────────────────────
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user.id, status: { $in: ['pending', 'confirmed'] } },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    notifyUser({
      userId: appointment.citizen,
      title: 'Appointment cancelled',
      message: `Your appointment scheduled for ${new Date(appointment.scheduledAt).toLocaleString()} was cancelled by the doctor.`,
      type: 'appointment',
    });

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/doctors/appointments/:id/complete
// ─────────────────────────────────────────────
exports.completeAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user.id, status: 'confirmed' },
      { $set: { status: 'completed' } },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Confirmed appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/doctors/patients
// Distinct citizens this doctor has an appointment relationship with.
// ─────────────────────────────────────────────
exports.getPatients = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const citizenIds = await Appointment.distinct('citizen', { doctor: doctorId });

    const [patients, lastVisits] = await Promise.all([
      User.find({ _id: { $in: citizenIds } }).select('name email phone').lean(),
      Appointment.aggregate([
        { $match: { doctor: doctorId } },
        { $sort: { scheduledAt: -1 } },
        { $group: { _id: '$citizen', lastVisit: { $first: '$scheduledAt' }, lastStatus: { $first: '$status' }, visitCount: { $sum: 1 } } },
      ]),
    ]);

    const visitMap = new Map(lastVisits.map((v) => [v._id.toString(), v]));
    const data = patients.map((p) => ({
      ...p,
      lastVisit: visitMap.get(p._id.toString())?.lastVisit || null,
      lastStatus: visitMap.get(p._id.toString())?.lastStatus || null,
      visitCount: visitMap.get(p._id.toString())?.visitCount || 0,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/doctors/patients/:citizenId
// Full read-only patient profile — gated by the appointment relationship.
// Lab reports respect the citizen's own isSharedWithDoctor flag.
// ─────────────────────────────────────────────
exports.getPatientProfile = async (req, res, next) => {
  try {
    const { citizenId } = req.params;
    const hasAccess = await assertDoctorHasPatient(req.user.id, citizenId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'No appointment relationship with this patient' });
    }

    const [citizen, vitals, sharedLabReports, activeMedications, appointmentHistory] = await Promise.all([
      User.findById(citizenId).select('name email phone createdAt').lean(),
      getLatestVitalsMap(citizenId),
      LabReport.find({ citizen: citizenId, isSharedWithDoctor: true }).sort({ conductedAt: -1 }).limit(10).lean(),
      Medication.find({ citizen: citizenId, isActive: true }).sort({ createdAt: -1 }).lean(),
      Appointment.find({ citizen: citizenId, doctor: req.user.id }).sort({ scheduledAt: -1 }).limit(20).lean(),
    ]);

    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({
      success: true,
      data: { citizen, vitals, sharedLabReports, activeMedications, appointmentHistory },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/doctors/prescriptions
// Creates a Medication entry (existing model — Medication already has a
// `prescribedBy` field) on behalf of a permitted patient.
// ─────────────────────────────────────────────
exports.createPrescription = async (req, res, next) => {
  try {
    const { citizenId, ...rest } = req.body;
    const hasAccess = await assertDoctorHasPatient(req.user.id, citizenId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'No appointment relationship with this patient' });
    }

    const doctor = await User.findById(req.user.id).select('name');
    const medication = await Medication.create({
      citizen: citizenId,
      ...rest,
      prescribedBy: doctor.name,
    });

    notifyUser({
      userId: citizenId,
      title: 'New prescription',
      message: `Dr. ${doctor.name} prescribed ${medication.name} (${medication.dosage}).`,
      type: 'medication',
      link: '/phr',
    });

    res.status(201).json({ success: true, data: medication });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/doctors/prescriptions?citizenId=...
// Lists prescriptions this doctor has written (optionally for one patient).
// ─────────────────────────────────────────────
exports.getPrescriptions = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user.id).select('name');
    const query = { prescribedBy: doctor.name };
    if (req.query.citizenId) query.citizen = req.query.citizenId;

    const prescriptions = await Medication.find(query).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/doctors/availability
// ─────────────────────────────────────────────
exports.getAvailability = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user.id).select('doctorProfile').lean();
    res.json({ success: true, data: doctor.doctorProfile || { specialty: '', bio: '', availability: [] } });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PUT /api/doctors/availability
// ─────────────────────────────────────────────
exports.updateAvailability = async (req, res, next) => {
  try {
    const { specialty, bio, availability } = req.body;
    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'doctorProfile.specialty': specialty, 'doctorProfile.bio': bio, 'doctorProfile.availability': availability } },
      { new: true }
    ).select('doctorProfile');

    res.json({ success: true, data: doctor.doctorProfile });
  } catch (err) {
    next(err);
  }
};
