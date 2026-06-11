import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { RichText } from '@/components/ui/RichText';
import { icons } from '@/components/ui/Icon';
import type { MicroChallengeStep } from '@/content/curriculum.types';

interface MicroChallengeProps {
  step: MicroChallengeStep;
}

export function MicroChallenge({ step }: MicroChallengeProps) {
  return (
    <div className="space-y-4">
      <p className="font-heading text-sm font-semibold text-secondary">
        {step.prompt}
      </p>
      {step.variant === 'fill-blank' && step.fillBlank && (
        <FillBlankChallenge data={step.fillBlank} explanation={step.explanation} />
      )}
      {step.variant === 'order-steps' && step.orderSteps && (
        <OrderStepsChallenge data={step.orderSteps} explanation={step.explanation} />
      )}
      {step.variant === 'match-pairs' && step.matchPairs && (
        <MatchPairsChallenge data={step.matchPairs} explanation={step.explanation} />
      )}
    </div>
  );
}

interface FillBlankChallengeProps {
  data: NonNullable<MicroChallengeStep['fillBlank']>;
  explanation: string;
}

function FillBlankChallenge({ data, explanation }: FillBlankChallengeProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);

  const parts = data.code.split(/(___BLANK_\d+___)/);
  const allFilled = data.blanks.every((b) => (answers[b.id] ?? '').trim().length > 0);

  function checkAnswer(blankId: string, input: string): boolean {
    const blank = data.blanks.find((b) => b.id === blankId);
    if (!blank) return false;
    const normalized = input.trim().toLowerCase();
    if (blank.answer.toLowerCase() === normalized) return true;
    return blank.alternatives?.some((a) => a.toLowerCase() === normalized) ?? false;
  }

  function handleConfirm() {
    if (!allFilled || revealed) return;
    setRevealed(true);
  }

  return (
    <div className="space-y-3">
      <pre className="bg-bg-terminal border border-bg-elevated rounded-xl p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
        {parts.map((part, i) => {
          const match = part.match(/^___BLANK_(\d+)___$/);
          if (!match) return <span key={i}>{part}</span>;

          const blankIdx = parseInt(match[1]);
          const blank = data.blanks[blankIdx];
          if (!blank) return <span key={i}>{part}</span>;

          const value = answers[blank.id] ?? '';
          const isCorrect = revealed && checkAnswer(blank.id, value);
          const isWrong = revealed && !isCorrect;

          return (
            <input
              key={i}
              type="text"
              value={value}
              onChange={(e) => setAnswers({ ...answers, [blank.id]: e.target.value })}
              disabled={revealed}
              placeholder="..."
              className={`
                inline-block w-24 px-2 py-0.5 mx-0.5 rounded border font-mono text-sm
                bg-bg-elevated text-text-main outline-none transition-colors
                ${isCorrect ? 'border-primary/60 bg-primary/10 text-primary' : ''}
                ${isWrong ? 'border-accent/60 bg-accent/10 text-accent' : ''}
                ${!revealed ? 'border-bg-elevated focus:border-secondary/60' : ''}
              `}
            />
          );
        })}
      </pre>

      <AnimatePresence>
        {!revealed && allFilled && (
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

      <RevealExplanation revealed={revealed} explanation={explanation}
        isCorrect={data.blanks.every((b) => checkAnswer(b.id, answers[b.id] ?? ''))}
      />
    </div>
  );
}

interface OrderStepsChallengeProps {
  data: NonNullable<MicroChallengeStep['orderSteps']>;
  explanation: string;
}

function OrderStepsChallenge({ data, explanation }: OrderStepsChallengeProps) {
  const shuffled = useMemo(
    () => [...data.items].sort(() => Math.random() - 0.5),
    [data.items],
  );
  const [order, setOrder] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>(shuffled);
  const [revealed, setRevealed] = useState(false);

  function handlePickFromPool(item: string) {
    if (revealed) return;
    setPool((prev) => prev.filter((_, i) => i !== prev.indexOf(item)));
    setOrder((prev) => [...prev, item]);
  }

  function handleReturnToPool(item: string) {
    if (revealed) return;
    setOrder((prev) => prev.filter((_, i) => i !== prev.indexOf(item)));
    setPool((prev) => [...prev, item]);
  }

  function handleConfirm() {
    if (pool.length > 0 || revealed) return;
    setRevealed(true);
  }

  const allPlaced = pool.length === 0;

  return (
    <div className="space-y-3">
      {pool.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pool.map((item, idx) => (
            <motion.button
              key={`pool-${idx}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePickFromPool(item)}
              className="px-3 py-1.5 rounded-lg border border-bg-elevated
                bg-bg-surface hover:bg-bg-elevated font-mono text-sm
                text-text-main cursor-pointer transition-colors"
            >
              {item}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 rounded-xl
        border border-dashed border-bg-elevated bg-bg-terminal"
      >
        {order.length === 0 && (
          <span className="text-text-muted text-xs font-body">
            Toque nos itens acima para colocá-los em ordem
          </span>
        )}
        {order.map((item, idx) => {
          const isCorrect = revealed && item === data.items[idx];
          const isWrong = revealed && item !== data.items[idx];

          return (
            <motion.button
              key={`order-${idx}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={!revealed ? { scale: 0.95 } : {}}
              onClick={() => handleReturnToPool(item)}
              disabled={revealed}
              className={`
                px-3 py-1.5 rounded-lg border font-mono text-sm transition-colors
                ${isCorrect ? 'border-primary/60 bg-primary/10 text-primary' : ''}
                ${isWrong ? 'border-accent/60 bg-accent/10 text-accent' : ''}
                ${!revealed ? 'border-secondary/40 bg-secondary/10 text-text-main cursor-pointer' : ''}
              `}
            >
              {item}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {!revealed && allPlaced && (
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

      <RevealExplanation revealed={revealed} explanation={explanation}
        isCorrect={order.every((item, i) => item === data.items[i])}
      />
    </div>
  );
}

const PAIR_COLORS = [
  'border-primary/60 bg-primary/10 text-primary',
  'border-secondary/60 bg-secondary/10 text-secondary',
  'border-warning/60 bg-warning/10 text-warning',
  'border-accent/60 bg-accent/10 text-accent',
];

interface MatchPairsChallengeProps {
  data: NonNullable<MicroChallengeStep['matchPairs']>;
  explanation: string;
}

function MatchPairsChallenge({ data, explanation }: MatchPairsChallengeProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [connections, setConnections] = useState<Map<number, number>>(new Map());
  const [revealed, setRevealed] = useState(false);

  const shuffledRight = useMemo(
    () => data.pairs.map((_, i) => i).sort(() => Math.random() - 0.5),
    [data.pairs],
  );

  function handleLeftClick(idx: number) {
    if (revealed) return;
    if (connections.has(idx)) {
      const next = new Map(connections);
      next.delete(idx);
      setConnections(next);
      return;
    }
    setSelectedLeft(idx);
  }

  function handleRightClick(rightIdx: number) {
    if (revealed || selectedLeft === null) return;
    const alreadyConnectedLeft = [...connections.entries()]
      .find(([, r]) => r === rightIdx)?.[0];
    if (alreadyConnectedLeft !== undefined) {
      const next = new Map(connections);
      next.delete(alreadyConnectedLeft);
      setConnections(next);
    }
    const next = new Map(connections);
    next.set(selectedLeft, rightIdx);
    setConnections(next);
    setSelectedLeft(null);
  }

  function handleConfirm() {
    if (connections.size < data.pairs.length || revealed) return;
    setRevealed(true);
  }

  const allConnected = connections.size >= data.pairs.length;

  function pairColorForLeft(leftIdx: number): string {
    const connIdx = [...connections.entries()].findIndex(([l]) => l === leftIdx);
    return connIdx >= 0 ? PAIR_COLORS[connIdx % PAIR_COLORS.length] : '';
  }

  function pairColorForRight(rightIdx: number): string {
    const connIdx = [...connections.entries()].findIndex(([, r]) => r === rightIdx);
    return connIdx >= 0 ? PAIR_COLORS[connIdx % PAIR_COLORS.length] : '';
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {data.pairs.map((pair, idx) => {
            const isConnected = connections.has(idx);
            const isSelected = selectedLeft === idx;
            const colorClass = isConnected ? pairColorForLeft(idx) : '';

            let revealClass = '';
            if (revealed && isConnected) {
              const rightIdx = connections.get(idx)!;
              revealClass = rightIdx === idx
                ? 'ring-2 ring-primary/60'
                : 'ring-2 ring-accent/60';
            }

            return (
              <motion.button
                key={`left-${idx}`}
                whileTap={!revealed ? { scale: 0.97 } : {}}
                onClick={() => handleLeftClick(idx)}
                disabled={revealed}
                className={`
                  w-full text-left px-3 py-2 rounded-lg border font-mono text-sm
                  transition-all
                  ${isSelected ? 'border-secondary bg-secondary/20 text-text-main' : ''}
                  ${isConnected ? colorClass : ''}
                  ${!isSelected && !isConnected ? 'border-bg-elevated bg-bg-surface text-text-main hover:border-secondary/40' : ''}
                  ${revealClass}
                  ${!revealed ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {pair.left}
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-2">
          {shuffledRight.map((originalIdx) => {
            const pair = data.pairs[originalIdx];
            const isConnected = [...connections.values()].includes(originalIdx);
            const colorClass = isConnected ? pairColorForRight(originalIdx) : '';

            let revealClass = '';
            if (revealed && isConnected) {
              const leftIdx = [...connections.entries()].find(([, r]) => r === originalIdx)?.[0];
              revealClass = leftIdx === originalIdx
                ? 'ring-2 ring-primary/60'
                : 'ring-2 ring-accent/60';
            }

            return (
              <motion.button
                key={`right-${originalIdx}`}
                whileTap={!revealed ? { scale: 0.97 } : {}}
                onClick={() => handleRightClick(originalIdx)}
                disabled={revealed}
                className={`
                  w-full text-left px-3 py-2 rounded-lg border font-mono text-sm
                  transition-all
                  ${isConnected ? colorClass : ''}
                  ${!isConnected ? 'border-bg-elevated bg-bg-surface text-text-main hover:border-secondary/40' : ''}
                  ${revealClass}
                  ${!revealed ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {pair.right}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {!revealed && allConnected && (
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

      <RevealExplanation
        revealed={revealed}
        explanation={explanation}
        isCorrect={[...connections.entries()].every(([l, r]) => l === r)}
      />
    </div>
  );
}

interface RevealExplanationProps {
  revealed: boolean;
  explanation: string;
  isCorrect: boolean;
}

function RevealExplanation({ revealed, explanation, isCorrect }: RevealExplanationProps) {
  return (
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
              ? <><icons.checkCircle /> Perfeito!</>
              : <><icons.cross /> Quase!</>
            }
          </p>
          <RichText
            content={explanation}
            className="font-body text-sm text-text-main leading-relaxed"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
