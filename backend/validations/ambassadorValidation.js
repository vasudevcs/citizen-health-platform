const { z } = require('zod');

const addNoteSchema = z.object({
  citizenId: z.string().min(1),
  category: z.enum(['visit', 'enrollment', 'follow_up', 'referral', 'other']).default('other'),
  note: z.string().trim().min(1).max(2000),
});

module.exports = { addNoteSchema };
