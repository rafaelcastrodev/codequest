import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';

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

const LEVEL_THRESHOLDS = [0, 50, 120, 220, 350, 500, 700, 950, 1250, 1600, 2000];
const LEVEL_TITLES = ['', 'Aprendiz', 'Aprendiz', 'Explorador', 'Explorador', 'Hacker', 'Hacker', 'Arquiteto', 'Arquiteto', 'Mestre do Código', 'Mestre do Código'];

import type { MasteryLevel } from '@/content/curriculum.types';
import { loadMasteryLevels } from '@/content/loader';

export type MasteryLevelDef = MasteryLevel;

const DEFAULT_MASTERY_LEVELS: MasteryLevel[] = [
  { minPercent: 0, title: '', color: 'muted', icon: 'star' },
];

let masteryLevels: MasteryLevel[] = DEFAULT_MASTERY_LEVELS;

loadMasteryLevels().then((data) => { masteryLevels = data; }).catch(() => {});

export interface ModuleMastery {
  level: number;
  title: string;
  color: string;
  icon: string;
  earnedStars: number;
  maxStars: number;
  percent: number;
}

export function getModuleMastery(
  lessons: { id: string }[],
  completedExercises: Record<string, { stars: number }>,
): ModuleMastery {
  const maxStars = lessons.length * 3;
  const earnedStars = lessons.reduce(
    (sum, l) => sum + (completedExercises[l.id]?.stars ?? 0),
    0,
  );
  const percent = maxStars === 0 ? 0 : Math.round((earnedStars / maxStars) * 100);
  const effective = earnedStars > 0 ? Math.max(1, percent) : 0;

  let matched: MasteryLevelDef = masteryLevels[0]!;
  let level = 0;
  for (let i = masteryLevels.length - 1; i >= 0; i--) {
    if (effective >= masteryLevels[i]!.minPercent) {
      matched = masteryLevels[i]!;
      level = i;
      break;
    }
  }

  return {
    level,
    title: matched.title,
    color: matched.color,
    icon: matched.icon,
    earnedStars,
    maxStars,
    percent,
  };
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function computeLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]!) return i + 1;
  }
  return 1;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] ?? 'Aprendiz';
}

export function getLevelProgress(xp: number): { current: number; next: number; percent: number } {
  const level = computeLevel(xp);
  const idx = level - 1;
  const current = LEVEL_THRESHOLDS[idx] ?? 0;
  const next = LEVEL_THRESHOLDS[idx + 1] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]!;
  const percent = next === current ? 100 : Math.round(((xp - current) / (next - current)) * 100);
  return { current, next, percent };
}

interface ProgressState {
  profile: ProfileData;
  xp: number;
  level: number;
  streak: StreakData;
  completedExercises: Record<string, CompletedExercise>;
  unlockedModules: string[];
  achievements: string[];

  setProfile: (name: string, avatar: string) => void;
  addXP: (amount: number) => void;
  completeExercise: (id: string, stars: number, hintsUsed: number) => void;
  updateStreak: () => void;
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
  level: 1,
  streak: { current: 0, best: 0, lastDate: '' },
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
          const bestHints = existing ? Math.min(existing.hintsUsed, hintsUsed) : hintsUsed;
          return {
            completedExercises: {
              ...s.completedExercises,
              [id]: {
                stars: bestStars,
                attempts,
                completedAt: new Date().toISOString(),
                hintsUsed: bestHints,
              },
            },
          };
        }),

      updateStreak: () =>
        set((s) => {
          const now = new Date();
          const today = toLocalDateString(now);
          const yesterday = toLocalDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
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
      name: STORAGE_KEYS.progress,
      partialize: (s) => ({
        profile: s.profile,
        xp: s.xp,
        level: s.level,
        streak: s.streak,
        completedExercises: s.completedExercises,
        unlockedModules: s.unlockedModules,
        achievements: s.achievements,
      }),
    },
  ),
);
