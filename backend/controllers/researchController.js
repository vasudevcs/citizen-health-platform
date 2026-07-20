const RiskAssessment = require('../models/RiskAssessment');
const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const Appointment = require('../models/Appointment');

// All queries here are aggregate-only (counts/averages) — no citizen
// identifiers are ever returned to keep this module privacy-safe for
// research use without a separate de-identification pipeline.

// ─────────────────────────────────────────────
// GET /research/risk-distribution — condition risk-level breakdown
// ─────────────────────────────────────────────
exports.getRiskDistribution = async (req, res, next) => {
  try {
    const conditions = ['diabetes', 'hypertension', 'cardiovascular', 'obesity'];
    const results = {};

    await Promise.all(
      conditions.map(async (cond) => {
        const rows = await RiskAssessment.aggregate([
          { $group: { _id: `$conditions.${cond}.level`, count: { $sum: 1 } } },
        ]);
        results[cond] = rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {
          low: 0,
          moderate: 0,
          high: 0,
          critical: 0,
        });
      })
    );

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /research/demographics — age bracket + gender + smoker distribution
// from the most recent assessment per citizen
// ─────────────────────────────────────────────
exports.getDemographics = async (req, res, next) => {
  try {
    const latestPerCitizen = await RiskAssessment.aggregate([
      { $sort: { citizen: 1, createdAt: -1 } },
      { $group: { _id: '$citizen', profile: { $first: '$profile' } } },
    ]);

    const ageBrackets = { '18-29': 0, '30-44': 0, '45-59': 0, '60+': 0, unknown: 0 };
    const genders = { male: 0, female: 0, other: 0, unknown: 0 };
    let smokers = 0;

    latestPerCitizen.forEach(({ profile }) => {
      const age = profile?.age;
      if (age == null) ageBrackets.unknown += 1;
      else if (age < 30) ageBrackets['18-29'] += 1;
      else if (age < 45) ageBrackets['30-44'] += 1;
      else if (age < 60) ageBrackets['45-59'] += 1;
      else ageBrackets['60+'] += 1;

      if (profile?.gender) genders[profile.gender] += 1;
      else genders.unknown += 1;

      if (profile?.smoker) smokers += 1;
    });

    res.json({
      success: true,
      data: {
        sampleSize: latestPerCitizen.length,
        ageBrackets,
        genders,
        smokerCount: smokers,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /research/wellbeing-trend — population-average mood score by day
// ─────────────────────────────────────────────
exports.getWellbeingTrend = async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 30, 90);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);

    const rows = await MoodEntry.aggregate([
      { $match: { recordedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$recordedAt' } },
          averageScore: { $avg: '$score' },
          entries: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: rows.map((r) => ({
        date: r._id,
        averageScore: Math.round(r.averageScore * 10) / 10,
        entries: r.entries,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /research/overview — population + platform-usage snapshot
// ─────────────────────────────────────────────
exports.getOverview = async (req, res, next) => {
  try {
    const [citizenCount, assessmentCount, appointmentCount] = await Promise.all([
      User.countDocuments({ role: 'citizen' }),
      RiskAssessment.countDocuments({}),
      Appointment.countDocuments({}),
    ]);

    res.json({
      success: true,
      data: { citizenCount, assessmentCount, appointmentCount },
    });
  } catch (err) {
    next(err);
  }
};
