import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import { VariableInspector } from './VariableInspector';
import { Button } from '@/components/ui/Button';
import type { HighlightStep } from '@/content/curriculum.types';
import type { VarSnapshot } from '@/engine/var-inspector';

hljs.registerLanguage('typescript', typescript);

interface StepThroughBlockProps {
  code: string;
  steps: HighlightStep[];
  explanation: string;
  snapshots?: VarSnapshot[];
  varNames?: string[];
}

export function StepThroughBlock({
  code,
  steps,
  explanation,
  snapshots,
  varNames,
}: StepThroughBlockProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isComplete = currentStep >= steps.length;

  const lines = useMemo(() => {
    const normalized = code.replace(/\n+$/, '');
    return normalized.split('\n').map((line) => ({
      text: line,
      html: hljs.highlight(line || ' ', { language: 'typescript' }).value,
    }));
  }, [code]);

  const activeLines = isComplete
    ? new Set(lines.map((_, i) => i + 1))
    : new Set(steps[currentStep]?.lines ?? []);

  function handleAdvance() {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  return (
    <div className="space-y-3">
      <pre className="cq-code-block bg-bg-terminal border border-bg-elevated rounded-xl overflow-x-auto">
        <div className="cq-code-inner">
          <div className="cq-line-gutter" aria-hidden="true">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <code className="language-typescript cq-code-content">
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isActive = activeLines.has(lineNum);
              return (
                <div
                  key={i}
                  className={`transition-all duration-200 ${
                    isActive
                      ? 'opacity-100 border-l-2 border-primary pl-1 -ml-[2px]'
                      : 'opacity-30'
                  }`}
                  dangerouslySetInnerHTML={{ __html: line.html }}
                />
              );
            })}
          </code>
        </div>
      </pre>

      <AnimatePresence mode="wait">
        {!isComplete && steps[currentStep] && (
          <motion.div
            key={`note-${currentStep}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="bg-secondary/10 border border-secondary/30 rounded-lg px-4 py-2"
          >
            <p className="font-body text-sm text-text-main">
              {steps[currentStep].note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {snapshots && varNames && varNames.length > 0 && currentStep > 0 && (
        <VariableInspector
          snapshots={snapshots}
          currentStep={Math.min(currentStep - 1, snapshots.length - 1)}
          varNames={varNames}
        />
      )}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-body text-sm text-text-muted leading-relaxed"
        >
          {explanation}
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Anterior
        </Button>
        <span className="text-xs text-text-muted font-mono">
          {isComplete ? 'Completo' : `${currentStep + 1} / ${steps.length}`}
        </span>
        {!isComplete && (
          <Button variant="primary" size="sm" onClick={handleAdvance}>
            Próximo
          </Button>
        )}
        {isComplete && <div />}
      </div>
    </div>
  );
}
