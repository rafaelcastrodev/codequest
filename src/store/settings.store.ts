import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';

interface SettingsState {
  soundEnabled: boolean;
  livesEnabled: boolean;
  toggleSound: () => void;
  toggleLives: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      livesEnabled: false,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleLives: () => set((s) => ({ livesEnabled: !s.livesEnabled })),
    }),
    { name: STORAGE_KEYS.settings },
  ),
);
