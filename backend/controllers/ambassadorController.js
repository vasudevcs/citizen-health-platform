const User = require('../models/User');
const AmbassadorNote = require('../models/AmbassadorNote');

// ─────────────────────────────────────────────
// GET /ambassador/citizens — searchable citizen directory
// ─────────────────────────────────────────────
exports.listCitizens = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const query = { role: 'citizen' };
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      query.$or = [{ name: re }, { email: re }, { phone: re }];
    }

    const [citizens, total] = await Promise.all([
      User.find(query)
        .select('name email phone isVerified createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: citizens,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /ambassador/citizens/:id — single citizen lookup (for deep-linking
// from the Citizens directory straight into the Notes page)
// ─────────────────────────────────────────────
exports.getCitizen = async (req, res, next) => {
  try {
    const citizen = await User.findOne({ _id: req.params.id, role: 'citizen' })
      .select('name email phone isVerified createdAt lastLoginAt')
      .lean();
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }
    res.json({ success: true, data: citizen });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /ambassador/citizens/:id/notes — field-note history for a citizen
// ─────────────────────────────────────────────
exports.listNotesForCitizen = async (req, res, next) => {
  try {
    const notes = await AmbassadorNote.find({ citizen: req.params.id })
      .sort({ createdAt: -1 })
      .populate('ambassador', 'name')
      .lean();
    res.json({ success: true, data: notes });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /ambassador/notes — log a new field note
// ─────────────────────────────────────────────
exports.addNote = async (req, res, next) => {
  try {
    const citizen = await User.findOne({ _id: req.body.citizenId, role: 'citizen' }).select('_id');
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }

    const note = await AmbassadorNote.create({
      ambassador: req.user.id,
      citizen: citizen._id,
      category: req.body.category,
      note: req.body.note,
    });
    await note.populate('ambassador', 'name');

    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /ambassador/stats — this ambassador's own activity summary
// ─────────────────────────────────────────────
exports.getMyStats = async (req, res, next) => {
  try {
    const [totalNotes, notesThisWeek, citizensReached] = await Promise.all([
      AmbassadorNote.countDocuments({ ambassador: req.user.id }),
      AmbassadorNote.countDocuments({
        ambassador: req.user.id,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
      }),
      AmbassadorNote.distinct('citizen', { ambassador: req.user.id }),
    ]);

    res.json({
      success: true,
      data: { totalNotes, notesThisWeek, citizensReached: citizensReached.length },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /ambassador/activity — this ambassador's recent notes across all
// citizens (unlike listNotesForCitizen, not scoped to one citizen)
// ─────────────────────────────────────────────
exports.getMyActivity = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const notes = await AmbassadorNote.find({ ambassador: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('citizen', 'name email')
      .lean();
    res.json({ success: true, data: notes });
  } catch (err) {
    next(err);
  }
};
