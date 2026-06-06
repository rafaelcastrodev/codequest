import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';

interface SettingsState {
  soundEnabled: boolean;
  livesEnabled: boolean;
  onboardingCompleted: boolean;
  debugMode: boolean;
  toggleSound: () => void;
  toggleLives: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  toggleDebugMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      livesEnabled: false,
      onboardingCompleted: false,
      debugMode: false,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleLives: () => set((s) => ({ livesEnabled: !s.livesEnabled })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
      toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
    }),
    { name: STORAGE_KEYS.settings },
  ),
);
