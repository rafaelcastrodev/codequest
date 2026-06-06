import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/progress.store';
import { useSettingsStore } from '@/store/settings.store';
import { Button } from '@/components/ui/Button';
import { triggerConfetti } from '@/utils/confetti';
import { playSound } from '@/utils/sounds';

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };
const ONBOARDING_XP = 10;

export function OnboardingCompletion() {
  const playerName = useProgressStore((s) => s.profile.name);
  const addXP = useProgressStore((s) => s.addXP);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const awarded = useRef(false);

  useEffect(() => {
    if (awarded.current) return;
    awarded.current = true;
    addXP(ONBOARDING_XP);
    triggerConfetti();
    if (soundEnabled) playSound('success');
  }, [addXP, soundEnabled]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={spring}
        className="relative z-10 w-full max-w-sm bg-bg-surface border border-bg-elevated rounded-2xl shadow-2xl p-6 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 15 }}
          className="text-6xl block mb-4"
        >
          🎉
        </motion.span>

        <h2 className="font-heading text-2xl font-bold text-primary mb-2">
          Tudo pronto!
        </h2>
        <p className="font-body text-sm text-[#8888AA] mb-5">
          Sua aventura começa agora, <span className="text-[#E8E8F0] font-semibold">{playerName}</span>!
        </p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-xl px-4 py-2 mb-6"
        >
          <span className="text-lg">✨</span>
          <span className="font-heading font-bold text-secondary">+{ONBOARDING_XP} XP</span>
        </motion.div>

        <Button variant="primary" size="lg" className="w-full" onClick={completeOnboarding}>
          Começar! 🚀
        </Button>
      </motion.div>
    </div>,
    document.body,
  );
}
