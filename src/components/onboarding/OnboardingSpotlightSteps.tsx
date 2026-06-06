import { useOnboardingStore, type OnboardingStep } from '@/store/onboarding.store';
import { useSettingsStore } from '@/store/settings.store';
import { useProgressStore } from '@/store/progress.store';
import { SpotlightOverlay } from './SpotlightOverlay';
import { Button } from '@/components/ui/Button';

interface TooltipCardProps {
  title: string;
  description: string;
  onNext: () => void;
  onSkip: () => void;
  stepLabel: string;
}

function TooltipCard({ title, description, onNext, onSkip, stepLabel }: TooltipCardProps) {
  return (
    <div className="bg-bg-surface border border-bg-elevated rounded-xl shadow-2xl p-4 mt-2">
      <span className="font-body text-[10px] text-[#8888AA] uppercase tracking-wider">{stepLabel}</span>
      <h3 className="font-heading font-semibold text-[#E8E8F0] text-sm mt-1 mb-1.5">{title}</h3>
      <p className="font-body text-xs text-[#8888AA] leading-relaxed mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs">
          Pular tutorial
        </Button>
        <Button variant="primary" size="sm" onClick={onNext}>
          Próximo →
        </Button>
      </div>
    </div>
  );
}

interface OnboardingSpotlightStepsProps {
  spotlightStep: 'journey' | 'stats';
}

export function OnboardingSpotlightSteps({ spotlightStep }: OnboardingSpotlightStepsProps) {
  const setStep = useOnboardingStore((s) => s.setStep);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const setProfile = useProgressStore((s) => s.setProfile);
  const { nameInput, selectedAvatar } = useOnboardingStore();

  const skip = () => {
    const name = nameInput.trim() || 'Jogador';
    setProfile(name, selectedAvatar);
    completeOnboarding();
  };

  const next = (nextStep: OnboardingStep) => () => setStep(nextStep);

  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

  if (spotlightStep === 'journey') {
    return (
      <SpotlightOverlay
        targetSelector='[data-onboarding="first-module"]'
        tooltipPosition="bottom"
        padding={12}
      >
        <TooltipCard
          stepLabel="Passo 1 de 2"
          title="Sua Jornada"
          description="Cada card é um módulo com várias lições. Complete as lições para avançar e desbloquear novos módulos!"
          onNext={next('spotlight-stats')}
          onSkip={skip}
        />
      </SpotlightOverlay>
    );
  }

  return (
    <SpotlightOverlay
      targetSelector={isDesktop ? '[data-onboarding="sidebar-stats"]' : '[data-onboarding="topbar-stats"]'}
      tooltipPosition={isDesktop ? 'right' : 'bottom'}
      padding={8}
    >
      <TooltipCard
        stepLabel="Passo 2 de 2"
        title="Seu Progresso"
        description="Acompanhe sua ofensiva diária e vidas aqui. Complete lições todos os dias para manter a sequência!"
        onNext={next('mini-exercise')}
        onSkip={skip}
      />
    </SpotlightOverlay>
  );
}
