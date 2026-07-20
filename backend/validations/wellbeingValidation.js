const { z } = require('zod');

const moodEntrySchema = z.object({
  mood: z.enum(['great', 'good', 'okay', 'low', 'struggling']),
  score: z.number().int().min(1).max(10),
  stressLevel: z.number().int().min(1).max(10).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  triggers: z.array(z.string().max(50)).max(10).default([]),
  note: z.string().max(1000).optional(),
  recordedAt: z.coerce.date().optional(),
});

module.exports = { moodEntrySchema };
