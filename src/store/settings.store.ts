import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      livesEnabled: true,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleLives: () => set((s) => ({ livesEnabled: !s.livesEnabled })),
    }),
    { name: 'codequest-settings' },
  ),
);
