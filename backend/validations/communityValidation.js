const { z } = require('zod');
const { POST_CATEGORIES } = require('../models/CommunityPost');

const createPostSchema = z.object({
  category: z.enum(POST_CATEGORIES).default('general'),
  title: z.string().trim().min(3).max(150),
  body: z.string().trim().min(1).max(5000),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

module.exports = { createPostSchema, createCommentSchema };
