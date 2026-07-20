const { z } = require('zod');

const progressUpdateSchema = z.object({
  completed: z.boolean().optional(),
  bookmarked: z.boolean().optional(),
});

module.exports = { progressUpdateSchema };
