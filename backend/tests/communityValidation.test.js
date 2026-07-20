const { createPostSchema, createCommentSchema } = require('../validations/communityValidation');

describe('communityValidation.createPostSchema', () => {
  it('accepts a valid post', () => {
    const result = createPostSchema.safeParse({
      category: 'support',
      title: 'Looking for advice',
      body: 'Has anyone managed a similar situation?',
    });
    expect(result.success).toBe(true);
  });

  it('defaults category to general when omitted', () => {
    const result = createPostSchema.safeParse({ title: 'Hello there', body: 'First post!' });
    expect(result.success).toBe(true);
    expect(result.data.category).toBe('general');
  });

  it('rejects a title that is too short', () => {
    const result = createPostSchema.safeParse({ title: 'Hi', body: 'Short title test' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid category', () => {
    const result = createPostSchema.safeParse({
      category: 'not-a-real-category',
      title: 'Valid title',
      body: 'Body text',
    });
    expect(result.success).toBe(false);
  });
});

describe('communityValidation.createCommentSchema', () => {
  it('rejects an empty comment', () => {
    const result = createCommentSchema.safeParse({ body: '' });
    expect(result.success).toBe(false);
  });

  it('accepts a normal comment', () => {
    const result = createCommentSchema.safeParse({ body: 'Thanks for sharing this!' });
    expect(result.success).toBe(true);
  });
});
