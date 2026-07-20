const CommunityPost = require('../models/CommunityPost');
const CommunityComment = require('../models/CommunityComment');
const { notifyUser } = require('../utils/notify');

const AUTHOR_SELECT = 'name role';

// ─────────────────────────────────────────────
// GET /community/posts — paginated feed, optional ?category=
// ─────────────────────────────────────────────
exports.listPosts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const query = { status: 'active' };
    if (req.query.category) query.category = req.query.category;

    const [posts, total] = await Promise.all([
      CommunityPost.find(query)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', AUTHOR_SELECT)
        .lean({ virtuals: true }),
      CommunityPost.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /community/posts
// ─────────────────────────────────────────────
exports.createPost = async (req, res, next) => {
  try {
    const post = await CommunityPost.create({ author: req.user.id, ...req.body });
    await post.populate('author', AUTHOR_SELECT);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /community/posts/:id — post detail + comments
// ─────────────────────────────────────────────
exports.getPost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findOne({ _id: req.params.id, status: 'active' })
      .populate('author', AUTHOR_SELECT)
      .lean({ virtuals: true });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comments = await CommunityComment.find({ post: post._id, status: 'active' })
      .sort({ createdAt: 1 })
      .populate('author', AUTHOR_SELECT)
      .lean({ virtuals: true });

    res.json({ success: true, data: { post, comments } });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// DELETE /community/posts/:id — author-only soft delete
// ─────────────────────────────────────────────
exports.deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.status === 'removed') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
    }
    post.status = 'removed';
    await post.save();
    res.json({ success: true, data: { id: post._id } });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /community/posts/:id/like — toggle like
// ─────────────────────────────────────────────
exports.toggleLikePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const existing = await CommunityPost.findOne({ _id: req.params.id, status: 'active' })
      .select('likes')
      .lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const alreadyLiked = existing.likes.some((id) => id.toString() === userId);
    // Atomic update — avoids the read-modify-write race where two
    // concurrent toggles both read the same starting array and the
    // second .save() silently clobbers the first's change.
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      alreadyLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true }
    ).select('likes');

    res.json({ success: true, data: { liked: !alreadyLiked, likesCount: post.likes.length } });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /community/posts/:id/comments
// ─────────────────────────────────────────────
exports.addComment = async (req, res, next) => {
  try {
    const post = await CommunityPost.findOne({ _id: req.params.id, status: 'active' });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await CommunityComment.create({
      post: post._id,
      author: req.user.id,
      body: req.body.body,
    });
    await comment.populate('author', AUTHOR_SELECT);

    post.commentsCount += 1;
    await post.save();

    // Notify the post's author (skip self-notify on your own post)
    if (post.author.toString() !== req.user.id) {
      await notifyUser({
        userId: post.author,
        title: 'New comment on your post',
        message: `Someone commented on "${post.title}"`,
        type: 'community',
        link: `/community/${post._id}`,
      });
    }

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /community/comments/:id/like — toggle like on a comment
// ─────────────────────────────────────────────
exports.toggleLikeComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const existing = await CommunityComment.findOne({ _id: req.params.id, status: 'active' })
      .select('likes')
      .lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const alreadyLiked = existing.likes.some((id) => id.toString() === userId);
    const comment = await CommunityComment.findByIdAndUpdate(
      req.params.id,
      alreadyLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true }
    ).select('likes');

    res.json({ success: true, data: { liked: !alreadyLiked, likesCount: comment.likes.length } });
  } catch (err) {
    next(err);
  }
};
