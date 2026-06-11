import { motion, AnimatePresence } from 'framer-motion';
import type { VarSnapshot } from '@/engine/var-inspector';

interface VariableInspectorProps {
  snapshots: VarSnapshot[];
  currentStep?: number;
  varNames: string[];
}

function formatValue(value: unknown): string {
  if (value === undefined) return '—';
  if (typeof value === 'string') return `"${value}"`;
  if (value === null) return 'null';
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch { return String(value); }
  }
  return String(value);
}

function typeLabel(value: unknown): string {
  if (value === undefined) return '';
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function typeColor(value: unknown): string {
  if (value === undefined) return 'text-text-muted';
  switch (typeof value) {
    case 'number': return 'text-warning';
    case 'string': return 'text-primary';
    case 'boolean': return 'text-secondary';
    default: return 'text-text-muted';
  }
}

export function VariableInspector({ snapshots, currentStep, varNames }: VariableInspectorProps) {
  const stepIdx = currentStep ?? snapshots.length - 1;
  const currentSnapshot = snapshots[stepIdx];
  const prevSnapshot = stepIdx > 0 ? snapshots[stepIdx - 1] : undefined;

  if (!currentSnapshot) return null;

  return (
    <div className="bg-bg-terminal border border-bg-elevated rounded-xl p-4">
      <p className="text-xs text-text-muted font-mono mb-3 uppercase tracking-wider">
        Variáveis
      </p>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {varNames.map((name) => {
            const value = currentSnapshot.vars[name];
            const prevValue = prevSnapshot?.vars[name];
            const appeared = value !== undefined;
            const changed = prevValue !== undefined && prevValue !== value;

            if (!appeared) return null;

            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: changed ? [1, 1.08, 1] : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 20,
                }}
                className={`
                  min-w-[5rem] bg-bg-elevated rounded-lg px-3 py-2
                  border transition-colors duration-300
                  ${changed ? 'border-warning/50' : 'border-bg-elevated'}
                `}
              >
                <p className="text-xs text-text-muted font-mono mb-1">{name}</p>
                <p className={`text-base font-mono font-semibold ${typeColor(value)}`}>
                  {formatValue(value)}
                </p>
                {typeLabel(value) && (
                  <p className="text-[10px] text-text-muted font-mono mt-0.5 opacity-60">
                    {typeLabel(value)}
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
