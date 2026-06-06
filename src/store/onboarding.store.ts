import { create } from 'zustand';

export type OnboardingStep = 'welcome' | 'avatar';

interface OnboardingState {
  step: OnboardingStep;
  nameInput: string;
  selectedAvatar: string;
  setStep: (step: OnboardingStep) => void;
  setNameInput: (name: string) => void;
  setSelectedAvatar: (avatar: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  step: 'welcome',
  nameInput: '',
  selectedAvatar: 'robot-1',
  setStep: (step) => set({ step }),
  setNameInput: (nameInput) => set({ nameInput }),
  setSelectedAvatar: (selectedAvatar) => set({ selectedAvatar }),
  reset: () => set({ step: 'welcome', nameInput: '', selectedAvatar: 'robot-1' }),
}));
