import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressStore, getLevelTitle, getLevelProgress } from '@/store/progress.store';
import { act } from '@testing-library/react';

function resetStore() {
  act(() => {
    useProgressStore.getState().resetProgress();
  });
}

describe('getLevelTitle', () => {
  it('returns correct titles for each level range', () => {
    expect(getLevelTitle(1)).toBe('Aprendiz');
    expect(getLevelTitle(2)).toBe('Aprendiz');
    expect(getLevelTitle(3)).toBe('Explorador');
    expect(getLevelTitle(4)).toBe('Explorador');
    expect(getLevelTitle(5)).toBe('Hacker');
    expect(getLevelTitle(6)).toBe('Hacker');
    expect(getLevelTitle(7)).toBe('Arquiteto');
    expect(getLevelTitle(8)).toBe('Arquiteto');
    expect(getLevelTitle(9)).toBe('Mestre do Código');
    expect(getLevelTitle(10)).toBe('Mestre do Código');
  });

  it('handles out-of-range levels gracefully', () => {
    expect(getLevelTitle(0)).toBe('');
    expect(getLevelTitle(11)).toBe('Mestre do Código');
    expect(getLevelTitle(99)).toBe('Mestre do Código');
  });
});

describe('getLevelProgress', () => {
  it('returns correct progress for xp within a level', () => {
    const progress = getLevelProgress(80);
    expect(progress.current).toBe(50);
    expect(progress.next).toBe(120);
    expect(progress.percent).toBeGreaterThan(0);
    expect(progress.percent).toBeLessThan(100);
  });

  it('returns 0% at level boundary', () => {
    const progress = getLevelProgress(50);
    expect(progress.percent).toBe(0);
  });

  it('returns 100% at max level', () => {
    const progress = getLevelProgress(2000);
    expect(progress.percent).toBe(100);
  });
});

describe('useProgressStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('XP and levels', () => {
    it('starts with 0 XP and level 1', () => {
      const { xp, level } = useProgressStore.getState();
      expect(xp).toBe(0);
      expect(level).toBe(1);
    });

    it('adds XP correctly', () => {
      act(() => useProgressStore.getState().addXP(60));
      expect(useProgressStore.getState().xp).toBe(60);
    });

    it('levels up at correct thresholds', () => {
      act(() => useProgressStore.getState().addXP(50));
      expect(useProgressStore.getState().level).toBe(2);

      act(() => useProgressStore.getState().addXP(70));
      expect(useProgressStore.getState().xp).toBe(120);
      expect(useProgressStore.getState().level).toBe(3);
    });

    it('reaches level 11 at 2000 XP', () => {
      act(() => useProgressStore.getState().addXP(2000));
      expect(useProgressStore.getState().level).toBe(11);
    });
  });

  describe('completeExercise', () => {
    it('records exercise completion', () => {
      act(() => useProgressStore.getState().completeExercise('ex1', 3, 0));
      const ex = useProgressStore.getState().completedExercises['ex1'];
      expect(ex).toBeDefined();
      expect(ex.stars).toBe(3);
      expect(ex.attempts).toBe(1);
      expect(ex.hintsUsed).toBe(0);
    });

    it('keeps best stars on repeat completion', () => {
      act(() => useProgressStore.getState().completeExercise('ex1', 3, 0));
      act(() => useProgressStore.getState().completeExercise('ex1', 1, 2));
      const ex = useProgressStore.getState().completedExercises['ex1'];
      expect(ex.stars).toBe(3);
      expect(ex.attempts).toBe(2);
    });

    it('upgrades stars if new attempt is better', () => {
      act(() => useProgressStore.getState().completeExercise('ex1', 1, 2));
      act(() => useProgressStore.getState().completeExercise('ex1', 3, 0));
      expect(useProgressStore.getState().completedExercises['ex1'].stars).toBe(3);
    });
  });

  describe('streak', () => {
    it('starts a new streak on first activity', () => {
      act(() => useProgressStore.getState().updateStreak());
      const { streak } = useProgressStore.getState();
      expect(streak.current).toBe(1);
      expect(streak.best).toBe(1);
    });

    it('does not double-count same day', () => {
      act(() => useProgressStore.getState().updateStreak());
      act(() => useProgressStore.getState().updateStreak());
      expect(useProgressStore.getState().streak.current).toBe(1);
    });

    it('increments streak for consecutive day', () => {
      const now = new Date();
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      useProgressStore.setState({
        streak: { current: 3, best: 5, lastDate: yesterdayStr },
      });

      act(() => useProgressStore.getState().updateStreak());
      const { streak } = useProgressStore.getState();
      expect(streak.current).toBe(4);
      expect(streak.best).toBe(5);
    });

    it('resets streak after gap', () => {
      useProgressStore.setState({
        streak: { current: 5, best: 5, lastDate: '2020-01-01' },
      });

      act(() => useProgressStore.getState().updateStreak());
      const { streak } = useProgressStore.getState();
      expect(streak.current).toBe(1);
      expect(streak.best).toBe(5);
    });

    it('updates best when current exceeds it', () => {
      const now = new Date();
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      useProgressStore.setState({
        streak: { current: 5, best: 5, lastDate: yesterdayStr },
      });

      act(() => useProgressStore.getState().updateStreak());
      expect(useProgressStore.getState().streak.best).toBe(6);
    });
  });

  describe('modules', () => {
    it('starts with 01-variaveis unlocked', () => {
      expect(useProgressStore.getState().unlockedModules).toContain('01-variaveis');
    });

    it('unlockModule adds a module', () => {
      act(() => useProgressStore.getState().unlockModule('02-tipos'));
      expect(useProgressStore.getState().unlockedModules).toContain('02-tipos');
    });

    it('unlockModule does not duplicate', () => {
      act(() => useProgressStore.getState().unlockModule('02-tipos'));
      act(() => useProgressStore.getState().unlockModule('02-tipos'));
      expect(
        useProgressStore.getState().unlockedModules.filter((m) => m === '02-tipos'),
      ).toHaveLength(1);
    });
  });

  describe('achievements', () => {
    it('unlockAchievement adds achievement id', () => {
      act(() => useProgressStore.getState().unlockAchievement('first-code'));
      expect(useProgressStore.getState().achievements).toContain('first-code');
    });

    it('unlockAchievement does not duplicate', () => {
      act(() => useProgressStore.getState().unlockAchievement('first-code'));
      act(() => useProgressStore.getState().unlockAchievement('first-code'));
      expect(
        useProgressStore.getState().achievements.filter((a) => a === 'first-code'),
      ).toHaveLength(1);
    });
  });

  describe('profile', () => {
    it('has default profile', () => {
      const { profile } = useProgressStore.getState();
      expect(profile.name).toBe('Jogador');
      expect(profile.avatar).toBe('robot-1');
    });

    it('setProfile updates name and avatar', () => {
      act(() => useProgressStore.getState().setProfile('Alice', 'cat-2'));
      const { profile } = useProgressStore.getState();
      expect(profile.name).toBe('Alice');
      expect(profile.avatar).toBe('cat-2');
    });
  });

  describe('resetProgress', () => {
    it('resets xp, level, streak but keeps profile', () => {
      act(() => useProgressStore.getState().setProfile('Alice', 'cat-2'));
      act(() => useProgressStore.getState().addXP(500));
      act(() => useProgressStore.getState().updateStreak());

      act(() => useProgressStore.getState().resetProgress());

      const state = useProgressStore.getState();
      expect(state.xp).toBe(0);
      expect(state.level).toBe(1);
      expect(state.streak.current).toBe(0);
      expect(state.profile.name).toBe('Alice');
    });
  });
});
