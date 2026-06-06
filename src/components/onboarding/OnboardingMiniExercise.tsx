import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding.store';
import { useProgressStore } from '@/store/progress.store';
import { useSettingsStore } from '@/store/settings.store';
import { Button } from '@/components/ui/Button';
import { triggerConfetti } from '@/utils/confetti';
import { playSound } from '@/utils/sounds';

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

export function OnboardingMiniExercise() {
  const playerName = useProgressStore((s) => s.profile.name);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const setStep = useOnboardingStore((s) => s.setStep);
  const { nameInput, selectedAvatar } = useOnboardingStore();
  const setProfile = useProgressStore((s) => s.setProfile);

  const [code, setCode] = useState('// Escreva seu código aqui\n');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [output, setOutput] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout>>();

  const skip = () => {
    const name = nameInput.trim() || 'Jogador';
    setProfile(name, selectedAvatar);
    completeOnboarding();
  };

  const handleRun = () => {
    const trimmed = code.replace(/\/\/.*$/gm, '').trim();
    const pattern = /console\s*\.\s*log\s*\(\s*(['"`])(.+?)\1\s*\)/;
    const match = trimmed.match(pattern);

    if (match) {
      const content = match[2] ?? '';
      setStatus('success');
      setOutput(`> ${content}`);
      triggerConfetti();
      if (soundEnabled) playSound('success');
      advanceTimeout.current = setTimeout(() => setStep('completion'), 1800);
    } else {
      setStatus('error');
      setOutput(`Dica: tente console.log('Olá, ${playerName}!')`);
      setShakeKey((k) => k + 1);
      if (soundEnabled) playSound('error');
    }
  };

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
        className="relative z-10 w-full max-w-md bg-bg-surface border border-bg-elevated rounded-2xl shadow-2xl p-6"
      >
        <div className="text-center mb-4">
          <span className="text-3xl block mb-2">🚀</span>
          <h2 className="font-heading text-xl font-bold text-[#E8E8F0] mb-1">
            Sua primeira missão!
          </h2>
          <p className="font-body text-sm text-[#8888AA]">
            Use <code className="text-primary bg-bg-elevated px-1.5 py-0.5 rounded text-xs font-mono">console.log()</code> para mostrar uma mensagem na tela
          </p>
        </div>

        <div className="bg-bg-elevated rounded-lg p-3 mb-3">
          <p className="font-body text-xs text-[#8888AA] mb-1">Exemplo:</p>
          <code className="font-mono text-sm text-primary">
            console.log(&apos;Olá, {playerName}!&apos;)
          </code>
        </div>

        <motion.div
          key={shakeKey}
          animate={shakeKey > 0 ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <textarea
            value={code}
            onChange={(e) => { setCode(e.target.value); setStatus('idle'); }}
            spellCheck={false}
            rows={3}
            className={`
              w-full bg-[#0A0A15] border rounded-xl p-4 font-mono text-sm text-[#E8E8F0] resize-none
              outline-none focus:ring-2 transition-colors
              ${status === 'success' ? 'border-primary/50 focus:ring-primary/30' :
                status === 'error' ? 'border-accent/50 focus:ring-accent/30' :
                'border-bg-elevated focus:border-primary/50 focus:ring-primary/30'}
            `}
          />
        </motion.div>

        {output && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 bg-[#0A0A15] rounded-lg p-3 overflow-hidden"
          >
            <p className={`font-mono text-sm ${status === 'success' ? 'text-primary' : 'text-warning'}`}>
              {output}
            </p>
          </motion.div>
        )}

        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="sm" onClick={skip} className="text-xs">
            Pular tutorial
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleRun}
            disabled={status === 'success'}
          >
            {status === 'success' ? '✓ Correto!' : '▶ Executar'}
          </Button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
