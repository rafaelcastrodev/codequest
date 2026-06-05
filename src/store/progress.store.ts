import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompletedExercise {
  stars: number;
  attempts: number;
  completedAt: string;
  hintsUsed: number;
}

interface ProfileData {
  name: string;
  avatar: string;
  createdAt: string;
}

interface StreakData {
  current: number;
  best: number;
  lastDate: string;
}

interface LivesData {
  current: number;
  lastRegen: string;
}

const LEVEL_THRESHOLDS = [0, 50, 120, 220, 350, 500, 700, 950, 1250, 1600, 2000];
const LEVEL_TITLES = ['', 'Aprendiz', 'Aprendiz', 'Explorador', 'Explorador', 'Hacker', 'Hacker', 'Arquiteto', 'Arquiteto', 'Mestre do Código', 'Mestre do Código'];
const MAX_LIVES = 5;
const REGEN_INTERVAL_MS = 30 * 60 * 1000;

function computeLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] ?? 'Aprendiz';
}

export function getLevelProgress(xp: number): { current: number; next: number; percent: number } {
  const level = computeLevel(xp);
  const current = LEVEL_THRESHOLDS[level] ?? 0;
  const next = LEVEL_THRESHOLDS[level + 1] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]!;
  const percent = next === current ? 100 : Math.round(((xp - current) / (next - current)) * 100);
  return { current, next, percent };
}

interface ProgressState {
  profile: ProfileData;
  xp: number;
  level: number;
  streak: StreakData;
  lives: LivesData;
  completedExercises: Record<string, CompletedExercise>;
  unlockedModules: string[];
  achievements: string[];

  setProfile: (name: string, avatar: string) => void;
  addXP: (amount: number) => void;
  completeExercise: (id: string, stars: number, hintsUsed: number) => void;
  updateStreak: () => void;
  useLive: () => boolean;
  regenLives: () => void;
  unlockModule: (moduleId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  resetProgress: () => void;
}

const defaultProfile: ProfileData = {
  name: 'Jogador',
  avatar: 'robot-1',
  createdAt: new Date().toISOString().split('T')[0]!,
};

const defaultState = {
  profile: defaultProfile,
  xp: 0,
  level: 0,
  streak: { current: 0, best: 0, lastDate: '' },
  lives: { current: MAX_LIVES, lastRegen: new Date().toISOString() },
  completedExercises: {} as Record<string, CompletedExercise>,
  unlockedModules: ['01-variaveis'],
  achievements: [] as string[],
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setProfile: (name, avatar) =>
        set((s) => ({ profile: { ...s.profile, name, avatar } })),

      addXP: (amount) =>
        set((s) => {
          const xp = s.xp + amount;
          return { xp, level: computeLevel(xp) };
        }),

      completeExercise: (id, stars, hintsUsed) =>
        set((s) => {
          const existing = s.completedExercises[id];
          const attempts = (existing?.attempts ?? 0) + 1;
          const bestStars = Math.max(existing?.stars ?? 0, stars);
          return {
            completedExercises: {
              ...s.completedExercises,
              [id]: {
                stars: bestStars,
                attempts,
                completedAt: new Date().toISOString(),
                hintsUsed,
              },
            },
          };
        }),

      updateStreak: () =>
        set((s) => {
          const today = new Date().toISOString().split('T')[0]!;
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;
          const { lastDate, current, best } = s.streak;

          if (lastDate === today) return {};
          const newCurrent = lastDate === yesterday ? current + 1 : 1;
          return {
            streak: {
              current: newCurrent,
              best: Math.max(best, newCurrent),
              lastDate: today,
            },
          };
        }),

      useLive: () => {
        const { lives } = get();
        if (lives.current <= 0) return false;
        set((s) => ({
          lives: { ...s.lives, current: s.lives.current - 1 },
        }));
        return true;
      },

      regenLives: () =>
        set((s) => {
          const now = Date.now();
          const lastRegen = new Date(s.lives.lastRegen).getTime();
          const intervals = Math.floor((now - lastRegen) / REGEN_INTERVAL_MS);
          if (intervals <= 0 || s.lives.current >= MAX_LIVES) return {};
          const newLives = Math.min(MAX_LIVES, s.lives.current + intervals);
          return {
            lives: {
              current: newLives,
              lastRegen: new Date(lastRegen + intervals * REGEN_INTERVAL_MS).toISOString(),
            },
          };
        }),

      unlockModule: (moduleId) =>
        set((s) => ({
          unlockedModules: s.unlockedModules.includes(moduleId)
            ? s.unlockedModules
            : [...s.unlockedModules, moduleId],
        })),

      unlockAchievement: (achievementId) =>
        set((s) => ({
          achievements: s.achievements.includes(achievementId)
            ? s.achievements
            : [...s.achievements, achievementId],
        })),

      resetProgress: () => set({ ...defaultState, profile: get().profile }),
    }),
    {
      name: 'codequest-progress',
      partialize: (s) => ({
        profile: s.profile,
        xp: s.xp,
        level: s.level,
        streak: s.streak,
        lives: s.lives,
        completedExercises: s.completedExercises,
        unlockedModules: s.unlockedModules,
        achievements: s.achievements,
      }),
    },
  ),
);
