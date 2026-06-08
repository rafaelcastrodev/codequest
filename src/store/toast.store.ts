import { create } from 'zustand';
import type { Achievement } from '@/content/curriculum.types';

export type ToastVariant = 'achievement' | 'levelup' | 'streak';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message: string;
  icon: string;
}

interface ToastState {
  queue: Toast[];
  pushAchievement: (achievement: Achievement) => void;
  pushLevelUp: (level: number, title: string) => void;
  pushStreak: (days: number) => void;
  dismiss: (id: string) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  queue: [],

  pushAchievement: (achievement) =>
    set((s) => ({
      queue: [
        ...s.queue,
        {
          id: `toast-${++nextId}`,
          variant: 'achievement',
          title: 'Troféu Desbloqueado!',
          message: achievement.title,
          icon: achievement.icon,
        },
      ],
    })),

  pushLevelUp: (level, title) =>
    set((s) => ({
      queue: [
        ...s.queue,
        {
          id: `toast-${++nextId}`,
          variant: 'levelup',
          title: `Nível ${level}!`,
          message: title,
          icon: 'levelUp',
        },
      ],
    })),

  pushStreak: (days) =>
    set((s) => ({
      queue: [
        ...s.queue,
        {
          id: `toast-${++nextId}`,
          variant: 'streak',
          title: `${days} dias seguidos!`,
          message: 'Continue assim 🔥',
          icon: 'fire',
        },
      ],
    })),

  dismiss: (id) =>
    set((s) => ({ queue: s.queue.filter((t) => t.id !== id) })),
}));
