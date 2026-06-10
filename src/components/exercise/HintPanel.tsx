import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { icons } from '@/components/ui/Icon';

export interface HintPanelProps {
  hints: string[];
  hintsUsed: number;
  onUseHint: () => void;
}

export function HintPanel({ hints, hintsUsed, onUseHint }: HintPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-warning/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
      >
        <span className="font-body font-semibold text-sm flex items-center gap-1">
          <icons.bulb /> Dica {hintsUsed}/{hints.length}
        </span>
        <span className="opacity-70">{expanded ? <icons.chevronUp /> : <icons.chevronDown />}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-warning/5 space-y-2">
              {hints.slice(0, hintsUsed).map((hint, i) => (
                <div key={i} className="text-sm text-text-main font-body">
                  <span className="text-warning font-semibold">#{i + 1}</span> {hint}
                </div>
              ))}
              {hintsUsed < hints.length && (
                <Button variant="warning" size="sm" onClick={onUseHint} className="mt-1 text-xs">
                  Revelar próxima dica {hintsUsed < 2 ? <>(−1<icons.starFilled />)</> : <>(já 1<icons.starFilled />)</>}
                </Button>
              )}
              {hintsUsed >= hints.length && (
                <p className="text-xs text-text-muted font-body">Todas as dicas foram reveladas.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
