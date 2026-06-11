import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { RichText } from '@/components/ui/RichText';
import { Button } from '@/components/ui/Button';
import { icons } from '@/components/ui/Icon';
import type { InteractiveExampleStep } from '@/content/curriculum.types';

interface PredictBlockProps {
  step: InteractiveExampleStep;
}

export function PredictBlock({ step }: PredictBlockProps) {
  const predict = step.predict!;
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const isCorrect = selected === predict.correctIndex;

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
  }

  function handleConfirm() {
    if (selected === null || revealed) return;
    setRevealed(true);
  }

  const question = predict.question ?? 'O que este código vai imprimir?';

  return (
    <div className="space-y-4">
      <CodeBlock code={step.code} />

      <div className="space-y-3">
        <p className="font-heading text-sm font-semibold text-secondary">
          {question}
        </p>

        <div className="space-y-2">
          {predict.choices.map((choice, idx) => {
            let borderClass = 'border-bg-elevated hover:border-primary/40';
            let bgClass = 'bg-bg-surface hover:bg-bg-elevated';
            let textClass = 'text-text-main';

            if (revealed) {
              if (idx === predict.correctIndex) {
                borderClass = 'border-primary/60';
                bgClass = 'bg-primary/10';
                textClass = 'text-primary';
              } else if (idx === selected && !isCorrect) {
                borderClass = 'border-accent/60';
                bgClass = 'bg-accent/10';
                textClass = 'text-accent';
              } else {
                borderClass = 'border-bg-elevated/50';
                bgClass = 'bg-bg-surface/50';
                textClass = 'text-text-muted';
              }
            } else if (idx === selected) {
              borderClass = 'border-secondary/60';
              bgClass = 'bg-secondary/10';
            }

            return (
              <motion.button
                key={idx}
                whileHover={!revealed ? { scale: 1.01 } : {}}
                whileTap={!revealed ? { scale: 0.99 } : {}}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={`
                  w-full text-left px-4 py-2.5 rounded-xl border transition-all
                  font-mono text-sm
                  ${bgClass} ${borderClass} ${textClass}
                  ${!revealed ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {choice}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {!revealed && selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-end"
            >
              <Button variant="primary" size="sm" onClick={handleConfirm}>
                Conferir
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 border ${
                isCorrect
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-accent/10 border-accent/30'
              }`}
            >
              <p className="font-body text-sm font-semibold mb-1">
                {isCorrect
                  ? <><icons.checkCircle /> Isso mesmo!</>
                  : <><icons.cross /> Não era essa!</>
                }
              </p>
              <RichText
                content={step.explanation}
                className="font-body text-sm text-text-main leading-relaxed"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
