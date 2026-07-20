const { levelFromScore } = require('../services/riskEngine');

describe('riskEngine.levelFromScore', () => {
  it('classifies low scores as low risk', () => {
    expect(levelFromScore(0)).toBe('low');
    expect(levelFromScore(24)).toBe('low');
  });

  it('classifies mid scores as moderate risk', () => {
    expect(levelFromScore(25)).toBe('moderate');
    expect(levelFromScore(49)).toBe('moderate');
  });

  it('classifies high scores as high risk', () => {
    expect(levelFromScore(50)).toBe('high');
    expect(levelFromScore(74)).toBe('high');
  });

  it('classifies top scores as critical risk', () => {
    expect(levelFromScore(75)).toBe('critical');
    expect(levelFromScore(100)).toBe('critical');
  });
});
