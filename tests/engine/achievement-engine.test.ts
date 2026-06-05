import { describe, it, expect } from 'vitest';
import { checkAchievement, findNewlyUnlocked } from '@/engine/achievement-engine';
import type { ProgressSnapshot } from '@/engine/achievement-engine';
import type { Achievement, Module } from '@/content/curriculum.types';

function makeState(overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot {
  return {
    xp: 0,
    streak: { current: 0 },
    completedExercises: {},
    achievements: [],
    ...overrides,
  };
}

function makeModules(): Map<string, Module> {
  return new Map([
    [
      'mod-1',
      {
        id: 'mod-1',
        title: 'Module 1',
        description: '',
        lessons: [
          { id: 'theory-1', title: 'Theory', type: 'theory' as const, xpReward: 10, steps: [] },
          {
            id: 'ex-1',
            title: 'Exercise 1',
            type: 'exercise' as const,
            difficulty: 1,
            xpReward: 20,
            instructions: '',
            starterCode: '',
            solution: '',
            validation: { strategy: 'output-match' as const },
            hints: [],
            commonMistakes: [],
          },
          {
            id: 'quiz-1',
            title: 'Quiz 1',
            type: 'quiz' as const,
            xpReward: 15,
            questions: [],
          },
        ],
      },
    ],
  ]);
}

describe('checkAchievement', () => {
  const modules = makeModules();

  it('returns false if achievement already unlocked', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'common',
      condition: { type: 'xp-total', amount: 0 },
    };
    const state = makeState({ achievements: ['a1'] });
    expect(checkAchievement(achievement, state, modules)).toBe(false);
  });

  it('exercise-complete: true when exercise is completed', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'common',
      condition: { type: 'exercise-complete', exerciseId: 'ex-1' },
    };
    const state = makeState({
      completedExercises: { 'ex-1': { stars: 3, attempts: 1, completedAt: '', hintsUsed: 0 } },
    });
    expect(checkAchievement(achievement, state, modules)).toBe(true);
  });

  it('exercise-complete: false when exercise not completed', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'common',
      condition: { type: 'exercise-complete', exerciseId: 'ex-1' },
    };
    expect(checkAchievement(achievement, makeState(), modules)).toBe(false);
  });

  it('module-complete: true when all graded lessons are completed', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'common',
      condition: { type: 'module-complete', moduleId: 'mod-1' },
    };
    const state = makeState({
      completedExercises: {
        'ex-1': { stars: 2, attempts: 1, completedAt: '', hintsUsed: 1 },
        'quiz-1': { stars: 3, attempts: 1, completedAt: '', hintsUsed: 0 },
      },
    });
    expect(checkAchievement(achievement, state, modules)).toBe(true);
  });

  it('module-complete: false when some graded lessons are missing', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'common',
      condition: { type: 'module-complete', moduleId: 'mod-1' },
    };
    const state = makeState({
      completedExercises: {
        'ex-1': { stars: 2, attempts: 1, completedAt: '', hintsUsed: 0 },
      },
    });
    expect(checkAchievement(achievement, state, modules)).toBe(false);
  });

  it('xp-total: true when xp meets threshold', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'common',
      condition: { type: 'xp-total', amount: 100 },
    };
    expect(checkAchievement(achievement, makeState({ xp: 100 }), modules)).toBe(true);
    expect(checkAchievement(achievement, makeState({ xp: 99 }), modules)).toBe(false);
  });

  it('streak: true when current streak meets days', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'common',
      condition: { type: 'streak', days: 3 },
    };
    expect(checkAchievement(achievement, makeState({ streak: { current: 3 } }), modules)).toBe(true);
    expect(checkAchievement(achievement, makeState({ streak: { current: 2 } }), modules)).toBe(false);
  });

  it('exercises-no-hints: counts exercises with 0 hints', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'common',
      condition: { type: 'exercises-no-hints', count: 2 },
    };
    const state = makeState({
      completedExercises: {
        'ex-1': { stars: 3, attempts: 1, completedAt: '', hintsUsed: 0 },
        'ex-2': { stars: 3, attempts: 1, completedAt: '', hintsUsed: 0 },
        'ex-3': { stars: 1, attempts: 2, completedAt: '', hintsUsed: 2 },
      },
    });
    expect(checkAchievement(achievement, state, modules)).toBe(true);
  });

  it('exercise-first-attempt: counts exercises completed on first try', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'common',
      condition: { type: 'exercise-first-attempt', count: 1 },
    };
    const state = makeState({
      completedExercises: {
        'ex-1': { stars: 3, attempts: 1, completedAt: '', hintsUsed: 0 },
      },
    });
    expect(checkAchievement(achievement, state, modules)).toBe(true);
  });

  it('module-perfect: true when all lessons have min stars', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'rare',
      condition: { type: 'module-perfect', moduleId: 'mod-1', minStars: 3 },
    };
    const state = makeState({
      completedExercises: {
        'ex-1': { stars: 3, attempts: 1, completedAt: '', hintsUsed: 0 },
        'quiz-1': { stars: 3, attempts: 1, completedAt: '', hintsUsed: 0 },
      },
    });
    expect(checkAchievement(achievement, state, modules)).toBe(true);
  });

  it('all-quizzes-complete: true when all quiz lessons are done', () => {
    const achievement: Achievement = {
      id: 'a1',
      title: 'Test',
      description: '',
      icon: '',
      rarity: 'legendary',
      condition: { type: 'all-quizzes-complete' },
    };
    const state = makeState({
      completedExercises: {
        'quiz-1': { stars: 2, attempts: 1, completedAt: '', hintsUsed: 0 },
      },
    });
    expect(checkAchievement(achievement, state, modules)).toBe(true);
  });
});

describe('findNewlyUnlocked', () => {
  it('returns only newly unlockable achievements', () => {
    const modules = makeModules();
    const achievements: Achievement[] = [
      { id: 'a1', title: '', description: '', icon: '', rarity: 'common', condition: { type: 'xp-total', amount: 50 } },
      { id: 'a2', title: '', description: '', icon: '', rarity: 'common', condition: { type: 'xp-total', amount: 200 } },
    ];
    const state = makeState({ xp: 100 });

    const result = findNewlyUnlocked(achievements, state, modules);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });

  it('returns empty array when nothing is new', () => {
    const modules = makeModules();
    const achievements: Achievement[] = [
      { id: 'a1', title: '', description: '', icon: '', rarity: 'common', condition: { type: 'xp-total', amount: 50 } },
    ];
    const state = makeState({ xp: 100, achievements: ['a1'] });

    expect(findNewlyUnlocked(achievements, state, modules)).toHaveLength(0);
  });
});
