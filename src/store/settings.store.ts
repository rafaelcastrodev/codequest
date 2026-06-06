import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';

interface SettingsState {
  soundEnabled: boolean;
  onboardingCompleted: boolean;
  debugMode: boolean;
  toggleSound: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  toggleDebugMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      onboardingCompleted: false,
      debugMode: false,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
      toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
    }),
    { name: STORAGE_KEYS.settings },
  ),
);
