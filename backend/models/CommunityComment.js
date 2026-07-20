const mongoose = require('mongoose');

const communityCommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: { type: String, required: true, maxlength: 2000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['active', 'removed'], default: 'active' },
  },
  { timestamps: true }
);

communityCommentSchema.index({ post: 1, createdAt: 1 });

communityCommentSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

communityCommentSchema.set('toJSON', { virtuals: true });
communityCommentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CommunityComment', communityCommentSchema);
