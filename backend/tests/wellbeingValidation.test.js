const { moodEntrySchema } = require('../validations/wellbeingValidation');

describe('wellbeingValidation.moodEntrySchema', () => {
  it('accepts a valid mood entry', () => {
    const result = moodEntrySchema.safeParse({ mood: 'good', score: 7 });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid mood value', () => {
    const result = moodEntrySchema.safeParse({ mood: 'ecstatic', score: 9 });
    expect(result.success).toBe(false);
  });

  it('rejects a score outside 1-10', () => {
    const result = moodEntrySchema.safeParse({ mood: 'okay', score: 15 });
    expect(result.success).toBe(false);
  });

  it('defaults triggers to an empty array', () => {
    const result = moodEntrySchema.safeParse({ mood: 'low', score: 3 });
    expect(result.success).toBe(true);
    expect(result.data.triggers).toEqual([]);
  });
});
