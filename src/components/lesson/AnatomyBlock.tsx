import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { RichText } from '@/components/ui/RichText';
import type { AnatomySegment } from '@/content/curriculum.types';

interface AnatomyBlockProps {
  segments: AnatomySegment[];
  explanation: string;
}

const SEGMENT_COLORS: Record<string, string> = {
  let: 'text-secondary',
  const: 'text-secondary',
  var: 'text-secondary',
  number: 'text-warning',
  string: 'text-primary',
  boolean: 'text-primary',
};

function segmentColor(text: string): string {
  const trimmed = text.trim();
  if (trimmed in SEGMENT_COLORS) return SEGMENT_COLORS[trimmed];
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) return 'text-primary';
  if (/^\d/.test(trimmed)) return 'text-warning';
  if (trimmed === ':' || trimmed === '=' || trimmed === ';') return 'text-text-muted';
  return 'text-text-main';
}

export function AnatomyBlock({ segments, explanation }: AnatomyBlockProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const isComplete = visibleCount >= segments.length;

  const advance = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 1, segments.length));
  }, [segments.length]);

  useEffect(() => {
    if (visibleCount >= segments.length) return;
    const timer = setTimeout(advance, 800);
    return () => clearTimeout(timer);
  }, [visibleCount, segments.length, advance]);

  return (
    <div className="space-y-4">
      <div className="bg-bg-terminal border border-bg-elevated rounded-xl p-6">
        <div className="font-mono text-lg flex flex-wrap items-baseline gap-0.5 min-h-[2.5rem]">
          <AnimatePresence>
            {segments.slice(0, visibleCount).map((seg, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <span className={segmentColor(seg.text)}>{seg.text}</span>
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-1
                    text-[10px] text-secondary font-body whitespace-nowrap
                    bg-secondary/10 border border-secondary/20 rounded px-1.5 py-0.5"
                >
                  {seg.label}
                </motion.span>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {!isComplete && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={advance}>
            Revelar próximo
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RichText
              content={explanation}
              className="text-text-muted font-body text-sm leading-relaxed"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
