import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { RichText } from '@/components/ui/RichText';
import { icons } from '@/components/ui/Icon';
import { starsFromHints } from '@/engine/hint-engine';

export interface HintPanelProps {
  hints: string[];
  hintsUsed: number;
  onUseHint: () => void;
}

function StarMeter({ hintsUsed }: { hintsUsed: number }) {
  const current = starsFromHints(hintsUsed);
  const next = starsFromHints(hintsUsed + 1);
  const willLose = current > next;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => {
        const filled = i <= current;
        const isAtRisk = willLose && i === current;

        return (
          <motion.span
            key={i}
            animate={isAtRisk ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
            transition={isAtRisk ? { repeat: Infinity, duration: 1.5 } : {}}
            className={filled ? 'text-warning' : 'text-text-muted/30'}
          >
            {filled ? <icons.star /> : <icons.starEmpty />}
          </motion.span>
        );
      })}
    </div>
  );
}

function HintCostLabel({ hintsUsed }: { hintsUsed: number }) {
  const current = starsFromHints(hintsUsed);
  const next = starsFromHints(hintsUsed + 1);

  if (current > next) {
    return <span className="text-accent">perde 1 estrela</span>;
  }
  return <span className="text-text-muted">sem custo extra</span>;
}

export function HintPanel({ hints, hintsUsed, onUseHint }: HintPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-warning/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
      >
        <span className="font-body font-semibold text-sm flex items-center gap-1.5">
          <icons.bulb /> Dicas
        </span>
        <div className="flex items-center gap-2">
          <StarMeter hintsUsed={hintsUsed} />
          <span className="opacity-70">{expanded ? <icons.chevronUp /> : <icons.chevronDown />}</span>
        </div>
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
            <div className="px-4 py-3 bg-warning/5 space-y-3">
              {hintsUsed === 0 && (
                <p className="text-xs text-text-muted font-body">
                  Você começa com 3 estrelas. Cada dica pode custar 1.
                </p>
              )}

              {hints.slice(0, hintsUsed).map((hint, i) => (
                <div key={i} className="text-sm text-text-main font-body flex gap-1.5">
                  <span className="text-warning font-semibold shrink-0">#{i + 1}</span>
                  <RichText content={hint} className="inline" />
                </div>
              ))}

              {hintsUsed < hints.length ? (
                <div className="flex items-center gap-3 pt-1">
                  <Button variant="warning" size="sm" onClick={onUseHint} className="text-xs">
                    Revelar dica {hintsUsed + 1}/{hints.length}
                  </Button>
                  <span className="text-xs font-body">
                    <HintCostLabel hintsUsed={hintsUsed} />
                  </span>
                </div>
              ) : (
                <p className="text-xs text-text-muted font-body">Todas as dicas foram reveladas.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
