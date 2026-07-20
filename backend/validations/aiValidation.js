const { z } = require('zod');

const chatSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(1000) }))
    .max(10)
    .default([]),
});

module.exports = { chatSchema };
