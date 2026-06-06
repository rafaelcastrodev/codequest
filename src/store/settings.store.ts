import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';

interface SettingsState {
  soundEnabled: boolean;
  livesEnabled: boolean;
  onboardingCompleted: boolean;
  toggleSound: () => void;
  toggleLives: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      livesEnabled: false,
      onboardingCompleted: false,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleLives: () => set((s) => ({ livesEnabled: !s.livesEnabled })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
    }),
    { name: STORAGE_KEYS.settings },
  ),
);
