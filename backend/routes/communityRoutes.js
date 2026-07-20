const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createPostSchema, createCommentSchema } = require('../validations/communityValidation');
const ctrl = require('../controllers/communityController');

// Scoped to citizen for now — that's the only role with Community UI/routes.
// Backend previously allowed any authenticated role, but with no frontend
// route for doctor/ambassador/researcher/admin, notification deep-links
// (e.g. "someone commented on your post") would 403 for those roles.
// Widen back to requireAuth-only once Community has UI for other roles.
router.use(requireAuth, requireRole('citizen'));

router.get('/posts', ctrl.listPosts);
router.post('/posts', validate(createPostSchema), ctrl.createPost);
router.get('/posts/:id', ctrl.getPost);
router.delete('/posts/:id', ctrl.deletePost);
router.post('/posts/:id/like', ctrl.toggleLikePost);
router.post('/posts/:id/comments', validate(createCommentSchema), ctrl.addComment);
router.post('/comments/:id/like', ctrl.toggleLikeComment);

module.exports = router;
