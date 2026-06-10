import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './constants';

type FontScale = 0 | 1 | 2;
export type AppTheme = 'dark' | 'light';
export type EditorTheme = 'codequest-dark' | 'dracula' | 'monokai' | 'github-light' | 'solarized';

interface SettingsState {
  soundEnabled: boolean;
  onboardingCompleted: boolean;
  debugMode: boolean;
  fontScale: FontScale;
  appTheme: AppTheme;
  editorTheme: EditorTheme;
  toggleSound: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  toggleDebugMode: () => void;
  cycleFontScale: () => void;
  setAppTheme: (theme: AppTheme) => void;
  setEditorTheme: (theme: EditorTheme) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      onboardingCompleted: false,
      debugMode: false,
      fontScale: 1 as FontScale,
      appTheme: 'dark' as AppTheme,
      editorTheme: 'codequest-dark' as EditorTheme,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
      toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
      cycleFontScale: () => set((s) => ({ fontScale: ((s.fontScale + 1) % 3) as FontScale })),
      setAppTheme: (appTheme) => set({ appTheme }),
      setEditorTheme: (editorTheme) => set({ editorTheme }),
    }),
    { name: STORAGE_KEYS.settings },
  ),
);
