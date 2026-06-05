import { create } from 'zustand';

interface SessionState {
  currentModuleId: string | null;
  currentLessonId: string | null;
  currentStepIndex: number;
  hintsUsed: number;

  setCurrentLesson: (moduleId: string, lessonId: string) => void;
  setStepIndex: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  useHint: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  currentModuleId: null,
  currentLessonId: null,
  currentStepIndex: 0,
  hintsUsed: 0,

  setCurrentLesson: (moduleId, lessonId) =>
    set({ currentModuleId: moduleId, currentLessonId: lessonId, currentStepIndex: 0, hintsUsed: 0 }),

  setStepIndex: (index) => set({ currentStepIndex: index }),

  nextStep: () => set((s) => ({ currentStepIndex: s.currentStepIndex + 1 })),

  prevStep: () =>
    set((s) => ({ currentStepIndex: Math.max(0, s.currentStepIndex - 1) })),

  useHint: () => set((s) => ({ hintsUsed: s.hintsUsed + 1 })),

  resetSession: () =>
    set({ currentModuleId: null, currentLessonId: null, currentStepIndex: 0, hintsUsed: 0 }),
}));
