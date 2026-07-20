const User = require('../models/User');
const Appointment = require('../models/Appointment');
const CommunityPost = require('../models/CommunityPost');
const RiskAssessment = require('../models/RiskAssessment');

// ─────────────────────────────────────────────
// GET /admin/stats — platform-wide snapshot for the dashboard
// ─────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const [usersByRole, totalAppointments, upcomingAppointments, totalPosts, flaggedPosts, riskAssessmentsRun, newUsersThisWeek] =
      await Promise.all([
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        Appointment.countDocuments({}),
        Appointment.countDocuments({ scheduledAt: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] } }),
        CommunityPost.countDocuments({ status: 'active' }),
        CommunityPost.countDocuments({ status: 'removed' }),
        RiskAssessment.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } }),
      ]);

    const roleCounts = usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});

    res.json({
      success: true,
      data: {
        totalUsers: Object.values(roleCounts).reduce((a, b) => a + b, 0),
        roleCounts,
        newUsersThisWeek,
        totalAppointments,
        upcomingAppointments,
        totalCommunityPosts: totalPosts,
        flaggedCommunityPosts: flaggedPosts,
        riskAssessmentsRun,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /admin/users — paginated, searchable, filterable user list
// ─────────────────────────────────────────────
exports.listUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      query.$or = [{ name: re }, { email: re }, { phone: re }];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email phone role isActive isVerified createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /admin/users/:id/status — activate/deactivate a user account
// ─────────────────────────────────────────────
exports.setUserActive = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(422).json({ success: false, message: 'isActive must be a boolean' });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select(
      'name email role isActive'
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /admin/community/flagged — moderation queue (removed/reported posts)
// ─────────────────────────────────────────────
exports.listFlaggedPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.find({ status: 'removed' })
      .sort({ updatedAt: -1 })
      .populate('author', 'name role')
      .limit(50)
      .lean({ virtuals: true });
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PATCH /admin/community/:id/restore — restore a removed post
// ─────────────────────────────────────────────
exports.restorePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /admin/reports/users.csv — export the full user list as CSV
// ─────────────────────────────────────────────
exports.exportUsersCsv = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name email phone role isActive isVerified createdAt lastLoginAt')
      .sort({ createdAt: -1 })
      .lean();

    const header = 'Name,Email,Phone,Role,Active,Verified,Created At,Last Login\n';
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = users
      .map((u) =>
        [u.name, u.email, u.phone, u.role, u.isActive, u.isVerified, u.createdAt, u.lastLoginAt || '']
          .map(escape)
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users-report.csv"');
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
};
