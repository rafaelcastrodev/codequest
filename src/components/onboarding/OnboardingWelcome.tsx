import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding.store';
import { useProgressStore } from '@/store/progress.store';
import { useSettingsStore } from '@/store/settings.store';
import { Avatar, AVATAR_IDS } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

interface SkipButtonProps {
  onSkip: () => void;
}

function SkipButton({ onSkip }: SkipButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs">
      Pular tutorial
    </Button>
  );
}

export function OnboardingWelcome() {
  const { step, nameInput, selectedAvatar, setStep, setNameInput, setSelectedAvatar } =
    useOnboardingStore();
  const setProfile = useProgressStore((s) => s.setProfile);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const skip = () => {
    const name = nameInput.trim() || 'Jogador';
    setProfile(name, selectedAvatar);
    completeOnboarding();
  };

  const goToAvatar = () => {
    setStep('avatar');
  };

  const goToSpotlight = () => {
    const name = nameInput.trim() || 'Jogador';
    setProfile(name, selectedAvatar);
    setStep('spotlight-journey');
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={spring}
            className="relative z-10 w-full max-w-sm bg-bg-surface border border-bg-elevated rounded-2xl shadow-2xl p-6"
          >
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3">⚡</span>
              <h1 className="font-heading text-2xl font-bold text-[#E8E8F0] mb-2">
                Bem-vindo ao CodeQuest!
              </h1>
              <p className="font-body text-sm text-[#8888AA] leading-relaxed">
                Sua aventura para dominar a programação começa agora!
              </p>
            </div>

            <div className="mb-6">
              <label className="block font-body text-xs text-[#8888AA] mb-1.5">
                Como quer ser chamado?
              </label>
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && goToAvatar()}
                placeholder="Digite seu nome (opcional)"
                maxLength={20}
                className="w-full font-body text-sm text-[#E8E8F0] bg-bg-elevated border border-bg-elevated rounded-lg px-3 py-2.5 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-colors placeholder:text-[#8888AA]/50"
              />
            </div>

            <div className="flex items-center justify-between">
              <SkipButton onSkip={skip} />
              <Button variant="primary" size="md" onClick={goToAvatar}>
                Continuar →
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'avatar' && (
          <motion.div
            key="avatar"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={spring}
            className="relative z-10 w-full max-w-sm bg-bg-surface border border-bg-elevated rounded-2xl shadow-2xl p-6"
          >
            <div className="text-center mb-5">
              <h2 className="font-heading text-xl font-semibold text-[#E8E8F0] mb-1">
                Escolha seu avatar
              </h2>
              <p className="font-body text-xs text-[#8888AA]">
                Você pode trocar depois no perfil
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {AVATAR_IDS.map((id) => (
                <Avatar
                  key={id}
                  id={id}
                  size="lg"
                  onClick={() => setSelectedAvatar(id)}
                  className={selectedAvatar === id ? 'border-primary border-glow-primary' : ''}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep('welcome')}>
                ← Voltar
              </Button>
              <Button variant="primary" size="md" onClick={goToSpotlight}>
                Continuar →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
