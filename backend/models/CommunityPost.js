const mongoose = require('mongoose');

const POST_CATEGORIES = ['general', 'support', 'tips', 'announcement'];

const communityPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: { type: String, enum: POST_CATEGORIES, default: 'general', index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true, maxlength: 5000 },
    tags: { type: [String], default: [] },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    // Soft-delete / moderation flag rather than a hard delete, so the
    // Admin module can review and restore removed content later.
    status: { type: String, enum: ['active', 'removed'], default: 'active', index: true },
  },
  { timestamps: true }
);

// Matches the two query shapes listPosts actually runs: status filter
// alone (feed with no category), and status+category (filtered feed) —
// both sorted by isPinned then createdAt.
communityPostSchema.index({ status: 1, isPinned: -1, createdAt: -1 });
communityPostSchema.index({ status: 1, category: 1, isPinned: -1, createdAt: -1 });

communityPostSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Ensures likesCount is still present on hydrated-document JSON/object
// output (e.g. if a future caller doesn't use .lean()) — the actual fix
// for lean() queries is the virtual declaration above, since .lean({
// virtuals: true }) only includes declared virtual paths, not toJSON
// transforms.
communityPostSchema.set('toJSON', { virtuals: true });
communityPostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
module.exports.POST_CATEGORIES = POST_CATEGORIES;
