import { AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings.store';
import { useProgressStore } from '@/store/progress.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingSpotlightSteps } from './OnboardingSpotlightSteps';
import { OnboardingMiniExercise } from './OnboardingMiniExercise';
import { OnboardingCompletion } from './OnboardingCompletion';

export function OnboardingOverlay() {
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);
  const completedExercises = useProgressStore((s) => s.completedExercises);
  const step = useOnboardingStore((s) => s.step);

  const isNewUser = !onboardingCompleted && Object.keys(completedExercises).length === 0;
  if (!isNewUser) return null;

  return (
    <AnimatePresence mode="wait">
      {(step === 'welcome' || step === 'avatar') && (
        <OnboardingWelcome key="welcome" />
      )}
      {step === 'spotlight-journey' && (
        <OnboardingSpotlightSteps key="spotlight-journey" spotlightStep="journey" />
      )}
      {step === 'spotlight-stats' && (
        <OnboardingSpotlightSteps key="spotlight-stats" spotlightStep="stats" />
      )}
      {step === 'mini-exercise' && (
        <OnboardingMiniExercise key="mini-exercise" />
      )}
      {step === 'completion' && (
        <OnboardingCompletion key="completion" />
      )}
    </AnimatePresence>
  );
}
