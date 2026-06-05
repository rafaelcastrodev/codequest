import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settings.store';
import { useProgressStore } from '@/store/progress.store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-bg-elevated last:border-0">
      <div>
        <p className="font-body font-semibold text-[#E8E8F0] text-sm">{label}</p>
        <p className="text-xs text-[#8888AA] font-body mt-0.5">{description}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onChange}
        className={`
          w-12 h-6 rounded-full transition-colors relative flex-shrink-0
          ${checked ? 'bg-primary' : 'bg-bg-elevated'}
        `}
      >
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-5 h-5 bg-white rounded-full absolute top-0.5"
        />
      </motion.button>
    </div>
  );
}

export function SettingsPage() {
  const { soundEnabled, livesEnabled, toggleSound, toggleLives } = useSettingsStore();
  const { resetProgress, profile } = useProgressStore();
  const [resetModalOpen, setResetModalOpen] = useState(false);

  function handleReset() {
    resetProgress();
    setResetModalOpen(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#E8E8F0]">Configurações</h1>

      <div className="bg-bg-surface border border-bg-elevated rounded-2xl px-5">
        <ToggleRow
          label="Sons"
          description="Efeitos sonoros de feedback ao acertar e errar"
          checked={soundEnabled}
          onChange={toggleSound}
        />
        <ToggleRow
          label="Sistema de Vidas"
          description="Perde uma vida ao errar. Desative para modo prática livre"
          checked={livesEnabled}
          onChange={toggleLives}
        />
      </div>

      <div className="bg-bg-surface border border-bg-elevated rounded-2xl p-5">
        <h2 className="font-heading font-semibold text-[#E8E8F0] mb-2">Conta</h2>
        <p className="text-xs text-[#8888AA] font-body mb-4">
          Jogando como <strong className="text-[#E8E8F0]">{profile.name}</strong>
        </p>
        <Button variant="danger" size="sm" onClick={() => setResetModalOpen(true)}>
          Resetar Progresso
        </Button>
      </div>

      <Modal open={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Resetar Progresso">
        <p className="text-[#8888AA] font-body text-sm mb-6">
          Isso vai apagar <strong className="text-accent">todo</strong> o seu progresso: XP, streak,
          lições concluídas e badges. Essa ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={() => setResetModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="accent" size="md" className="flex-1" onClick={handleReset}>
            Resetar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
