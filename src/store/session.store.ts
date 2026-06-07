import { create } from 'zustand';

interface SessionState {
  hintsUsed: number;

  setCurrentLesson: (moduleId: string, lessonId: string) => void;
  useHint: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  hintsUsed: 0,

  setCurrentLesson: (_moduleId, _lessonId) =>
    set({ hintsUsed: 0 }),

  useHint: () => set((s) => ({ hintsUsed: s.hintsUsed + 1 })),
}));
