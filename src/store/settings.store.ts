import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';

type FontScale = 0 | 1 | 2;

interface SettingsState {
  soundEnabled: boolean;
  onboardingCompleted: boolean;
  debugMode: boolean;
  fontScale: FontScale;
  toggleSound: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  toggleDebugMode: () => void;
  cycleFontScale: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      onboardingCompleted: false,
      debugMode: false,
      fontScale: 1 as FontScale,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
      toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
      cycleFontScale: () => set((s) => ({ fontScale: ((s.fontScale + 1) % 3) as FontScale })),
    }),
    { name: STORAGE_KEYS.settings },
  ),
);
