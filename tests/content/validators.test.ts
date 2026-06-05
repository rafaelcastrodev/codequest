import { describe, it, expect } from 'vitest';
import { validateCurriculum, validateModule, validateAchievements } from '@/content/validators';

describe('validateCurriculum', () => {
  it('returns true for valid curriculum', () => {
    expect(validateCurriculum({ version: '1.0', modules: [] })).toBe(true);
  });

  it('returns false for null', () => {
    expect(validateCurriculum(null)).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(validateCurriculum('string')).toBe(false);
  });
});

describe('validateModule', () => {
  it('returns true for valid module', () => {
    expect(validateModule({ id: 'mod-1', title: 'Test', lessons: [] })).toBe(true);
  });

  it('returns false for null', () => {
    expect(validateModule(null)).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(validateModule(42)).toBe(false);
  });
});

describe('validateAchievements', () => {
  it('returns true for valid achievements file', () => {
    expect(validateAchievements({ achievements: [] })).toBe(true);
  });

  it('returns false for null', () => {
    expect(validateAchievements(null)).toBe(false);
  });
});
