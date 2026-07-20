const MoodEntry = require('../models/MoodEntry');
const { notifyUser } = require('../utils/notify');

// Mood → numeric weight used for the "current state" summary label.
const MOOD_WEIGHT = { great: 5, good: 4, okay: 3, low: 2, struggling: 1 };

// Static curated resource + mindfulness library. No CMS yet, so this lives
// in code (same approach the platform uses for other static reference
// data) — swap for a WellbeingResource collection later if editors need
// to manage this without a deploy.
const RESOURCES = [
  {
    id: 'breathing-478',
    category: 'exercise',
    title: '4-7-8 Breathing',
    description: 'A short guided breathing pattern to calm the nervous system before sleep or a stressful moment.',
    durationMinutes: 5,
  },
  {
    id: 'body-scan',
    category: 'exercise',
    title: 'Body Scan Meditation',
    description: 'Progressive relaxation moving attention through the body to release tension.',
    durationMinutes: 10,
  },
  {
    id: 'gratitude-journal',
    category: 'exercise',
    title: 'Gratitude Journaling',
    description: 'Write three things you are grateful for today to shift focus toward the positive.',
    durationMinutes: 5,
  },
  {
    id: 'understanding-anxiety',
    category: 'article',
    title: 'Understanding Anxiety',
    description: 'What anxiety is, common triggers, and evidence-based coping strategies.',
    durationMinutes: 8,
  },
  {
    id: 'sleep-hygiene',
    category: 'article',
    title: 'Better Sleep Hygiene',
    description: 'Practical habits that improve sleep quality and mood over time.',
    durationMinutes: 6,
  },
  {
    id: 'stress-work',
    category: 'article',
    title: 'Managing Work-Related Stress',
    description: 'Recognizing burnout early and setting sustainable boundaries.',
    durationMinutes: 7,
  },
];

// Crisis support contacts shown alongside resources — always available,
// not gated behind any particular mood score.
const CRISIS_CONTACTS = [
  { name: 'National Suicide & Crisis Lifeline (US)', contact: '988', available: '24/7' },
  { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7' },
];

// ─────────────────────────────────────────────
// GET /wellbeing/mood  — trend history (default 30 days)
// ─────────────────────────────────────────────
exports.getMoodHistory = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const days = Math.min(parseInt(req.query.days, 10) || 30, 90);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);

    const entries = await MoodEntry.find({ citizen: citizenId, recordedAt: { $gte: since } })
      .sort({ recordedAt: 1 })
      .lean();

    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /wellbeing/mood  — add a check-in
// ─────────────────────────────────────────────
exports.addMoodEntry = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const entry = await MoodEntry.create({ citizen: citizenId, ...req.body });

    // Gentle proactive nudge on a low/struggling entry — mirrors the
    // health_alert pattern used for abnormal vitals.
    if (entry.mood === 'struggling' || entry.mood === 'low') {
      await notifyUser({
        userId: citizenId,
        title: 'Checking in on you',
        message: 'We noticed a tough entry in your mood log. Support resources are available whenever you need them.',
        type: 'wellbeing',
        link: '/mental-wellbeing',
      });
    }

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /wellbeing/summary — dashboard widget: latest state + 7-day average
// ─────────────────────────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    const [latest, recentEntries] = await Promise.all([
      MoodEntry.findOne({ citizen: citizenId }).sort({ recordedAt: -1 }).lean(),
      MoodEntry.find({ citizen: citizenId, recordedAt: { $gte: sevenDaysAgo } }).lean(),
    ]);

    const avgScore = recentEntries.length
      ? recentEntries.reduce((sum, e) => sum + e.score, 0) / recentEntries.length
      : null;

    const checkInsThisWeek = recentEntries.length;
    const streak = await computeStreak(citizenId);

    res.json({
      success: true,
      data: {
        latestMood: latest ? latest.mood : null,
        latestScore: latest ? latest.score : null,
        latestAt: latest ? latest.recordedAt : null,
        sevenDayAverageScore: avgScore !== null ? Math.round(avgScore * 10) / 10 : null,
        checkInsThisWeek,
        streakDays: streak,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Consecutive-day check-in streak, counting back from today.
async function computeStreak(citizenId) {
  const entries = await MoodEntry.find({ citizen: citizenId })
    .sort({ recordedAt: -1 })
    .select('recordedAt')
    .lean();
  if (entries.length === 0) return 0;

  const daysWithEntry = new Set(
    entries.map((e) => new Date(e.recordedAt).toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (daysWithEntry.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ─────────────────────────────────────────────
// GET /wellbeing/resources — static curated library + crisis contacts
// ─────────────────────────────────────────────
exports.getResources = async (req, res, next) => {
  try {
    res.json({ success: true, data: { resources: RESOURCES, crisisContacts: CRISIS_CONTACTS } });
  } catch (err) {
    next(err);
  }
};
