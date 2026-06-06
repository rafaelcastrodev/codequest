import { AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings.store';
import { useProgressStore } from '@/store/progress.store';
import { OnboardingWelcome } from './OnboardingWelcome';

export function OnboardingOverlay() {
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);
  const completedExercises = useProgressStore((s) => s.completedExercises);

  const isNewUser = !onboardingCompleted && Object.keys(completedExercises).length === 0;
  if (!isNewUser) return null;

  return (
    <AnimatePresence mode="wait">
      <OnboardingWelcome key="welcome" />
    </AnimatePresence>
  );
}
