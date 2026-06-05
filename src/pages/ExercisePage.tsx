import { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Monaco } from '@monaco-editor/react';
import { useExercise } from '@/hooks/useExercise';
import { useCodeRunner } from '@/hooks/useCodeRunner';
import { useProgressStore } from '@/store/progress.store';
import { useSessionStore } from '@/store/session.store';
import { useSettingsStore } from '@/store/settings.store';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { triggerConfetti } from '@/utils/confetti';
import { playSound } from '@/utils/sounds';
import { lessonPath } from '@/utils/lesson-path';
import type { ExerciseLesson } from '@/content/curriculum.types';

const MonacoEditor = lazy(() => import('@monaco-editor/react').then((m) => ({ default: m.Editor })));

function defineCodeQuestTheme(monaco: Monaco): void {
  monaco.editor.defineTheme('codequest-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '7C5CFC', fontStyle: 'bold' },
      { token: 'string', foreground: '00D4AA' },
      { token: 'number', foreground: 'FFB84D' },
      { token: 'comment', foreground: '8888AA', fontStyle: 'italic' },
      { token: 'type', foreground: '7C5CFC' },
    ],
    colors: {
      'editor.background': '#0A0A15',
      'editor.foreground': '#E8E8F0',
      'editorLineNumber.foreground': '#8888AA',
      'editorLineNumber.activeForeground': '#00D4AA',
      'editor.selectionBackground': '#25254266',
      'editor.lineHighlightBackground': '#1A1A2E88',
      'editorCursor.foreground': '#00D4AA',
      'editorBracketMatch.background': '#00D4AA22',
      'editorBracketMatch.border': '#00D4AA',
    },
  });
}

interface HintPanelProps {
  hints: string[];
  hintsUsed: number;
  onUseHint: () => void;
}

function HintPanel({ hints, hintsUsed, onUseHint }: HintPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-warning/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
      >
        <span className="font-body font-semibold text-sm">
          💡 Dica {hintsUsed}/{hints.length}
        </span>
        <span className="text-xs opacity-70">{expanded ? '▲' : '▼'}</span>
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
                <div key={i} className="text-sm text-[#E8E8F0] font-body">
                  <span className="text-warning font-semibold">#{i + 1}</span> {hint}
                </div>
              ))}
              {hintsUsed < hints.length && (
                <Button variant="warning" size="sm" onClick={onUseHint} className="mt-1 text-xs">
                  Revelar próxima dica {hintsUsed < 2 ? '(−1★)' : '(já 1★)'}
                </Button>
              )}
              {hintsUsed >= hints.length && (
                <p className="text-xs text-[#8888AA] font-body">Todas as dicas foram reveladas.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OutputPanelProps {
  output: string;
  errorMessage: string | null;
  mistakeMessage: string | null;
  status: string;
}

function OutputPanel({ output, errorMessage, mistakeMessage, status }: OutputPanelProps) {
  const isEmpty = !output && !errorMessage && !mistakeMessage;

  return (
    <div className="bg-[#0A0A15] border border-bg-elevated rounded-xl overflow-hidden h-40 flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-bg-elevated flex-shrink-0">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
        </div>
        <span className="text-xs text-[#8888AA] font-mono">console</span>
        {status === 'running' && (
          <span className="ml-auto text-xs text-[#8888AA] font-body animate-pulse">executando...</span>
        )}
      </div>
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        {isEmpty && (
          <p className="text-[#8888AA] font-mono text-xs opacity-50">
            Clique em ▶ Executar para ver a saída aqui
          </p>
        )}
        {mistakeMessage && (
          <p className="text-warning font-mono text-xs leading-relaxed">⚠️ {mistakeMessage}</p>
        )}
        {errorMessage && !mistakeMessage && (
          <pre className="text-accent font-mono text-xs leading-relaxed whitespace-pre-wrap">❌ {errorMessage}</pre>
        )}
        {output && (
          <pre className={`font-mono text-xs leading-relaxed whitespace-pre-wrap ${status === 'passed' ? 'text-primary' : 'text-[#E8E8F0]'}`}>{status === 'passed' ? '✅ ' : '📋 '}{output}</pre>
        )}
      </div>
    </div>
  );
}

interface SuccessOverlayProps {
  lesson: ExerciseLesson;
  stars: number;
  onNext: () => void;
  onMap: () => void;
}

function XPCounter({ xp }: { xp: number }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
      className="bg-secondary/20 border border-secondary/30 rounded-xl px-4 py-2 mb-6 inline-block"
    >
      <motion.span
        className="text-secondary font-heading font-bold text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        +{xp} XP
      </motion.span>
    </motion.div>
  );
}

function SuccessOverlay({ lesson, stars, onNext, onMap }: SuccessOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-bg-surface border border-primary/40 rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(0,212,170,0.2)]"
      >
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="font-heading text-2xl font-bold text-primary mb-1">Incrível!</h2>
        <p className="text-[#8888AA] font-body text-sm mb-4">{lesson.title}</p>

        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3].map((s) => (
            <motion.span
              key={s}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: s * 0.1, type: 'spring', stiffness: 400 }}
              className="text-3xl"
            >
              {s <= stars ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>

        <XPCounter xp={lesson.xpReward} />

        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onMap}>
            🗺️ Mapa
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={onNext}>
            Próximo →
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ExercisePage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const navigate = useNavigate();

  const { module: mod, exercise, loading, error } = useExercise(moduleId, lessonId);
  const runner = useCodeRunner();
  const { addXP, completeExercise, updateStreak, consumeLife, completedExercises } = useProgressStore();
  const { livesEnabled, soundEnabled } = useSettingsStore();
  const { hintsUsed, useHint, setCurrentLesson } = useSessionStore();
  const { checkAndUnlock } = useAchievements();

  const [code, setCode] = useState('');
  const [successStars, setSuccessStars] = useState<number | null>(null);
  const [editorBorderStatus, setEditorBorderStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [shakeKey, setShakeKey] = useState(0);
  const [noLivesModal, setNoLivesModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'instructions' | 'code'>('instructions');

  const resetRunner = runner.reset;

  useEffect(() => {
    if (exercise) {
      setCode(exercise.starterCode);
      setSuccessStars(null);
      setEditorBorderStatus('idle');
      resetRunner();
      if (moduleId && lessonId) setCurrentLesson(moduleId, lessonId);
    }
  }, [exercise, moduleId, lessonId, setCurrentLesson, resetRunner]);

  const handleRun = useCallback(async () => {
    if (!exercise || runner.status === 'running') return;

    const outcome = await runner.run(
      code,
      exercise.validation,
      exercise.commonMistakes,
      hintsUsed,
    );

    if (outcome.type === 'passed') {
      setSuccessStars(outcome.stars);
      setEditorBorderStatus('ok');
      const isFirstCompletion = !completedExercises[exercise.id];
      if (isFirstCompletion) addXP(exercise.xpReward);
      completeExercise(exercise.id, outcome.stars, hintsUsed);
      updateStreak();
      triggerConfetti();
      if (soundEnabled) playSound('success');
      setTimeout(() => checkAndUnlock(), 50);
    } else if (outcome.type === 'failed' || outcome.type === 'error') {
      setEditorBorderStatus('err');
      setShakeKey((k) => k + 1);
      if (soundEnabled) playSound('error');
      if (livesEnabled) {
        const remaining = consumeLife();
        if (remaining <= 0) {
          setNoLivesModal(true);
        }
      }
    }
  }, [exercise, runner, code, hintsUsed, addXP, completeExercise, completedExercises, updateStreak, livesEnabled, consumeLife, soundEnabled, checkAndUnlock]);

  const handleNext = useCallback(() => {
    if (!mod || !moduleId) return navigate('/');
    const lessons = mod.lessons;
    const idx = lessons.findIndex((l) => l.id === lessonId);
    const next = lessons[idx + 1];
    if (!next) return navigate('/');
    navigate(lessonPath(moduleId, next));
  }, [mod, moduleId, lessonId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#8888AA] font-body">{error ?? 'Exercício não encontrado.'}</p>
      </div>
    );
  }

  const editorBorderClass =
    editorBorderStatus === 'ok'
      ? 'border-primary/50'
      : editorBorderStatus === 'err'
      ? 'border-accent/50'
      : 'border-transparent';

  const instructionsPanel = (
    <div className="flex-1 lg:flex-initial lg:w-80 xl:w-96 flex-shrink-0 border-r border-bg-elevated bg-bg-surface flex flex-col overflow-hidden">
      <div className="p-5 border-b border-bg-elevated">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant={exercise.type === 'challenge' ? 'accent' : 'primary'} size="sm">
            {exercise.type === 'challenge' ? '🏆 Desafio' : '💻 Exercício'}
          </Badge>
          <Badge variant="secondary" size="sm">+{exercise.xpReward} XP</Badge>
          <Badge variant="muted" size="sm">{'⭐'.repeat(exercise.difficulty)}</Badge>
        </div>
        <h1 className="font-heading font-bold text-[#E8E8F0] text-lg leading-snug">{exercise.title}</h1>
      </div>

      <div className="flex-1 p-5 overflow-y-auto scrollbar-thin space-y-4">
        <div className="bg-bg-elevated rounded-xl p-4">
          <p className="font-body text-sm text-[#E8E8F0] leading-relaxed whitespace-pre-wrap">
            {exercise.instructions}
          </p>
        </div>

        {exercise.hints.length > 0 && (
          <HintPanel hints={exercise.hints} hintsUsed={hintsUsed} onUseHint={useHint} />
        )}
      </div>

      {/* Mobile: button to switch to code */}
      <div className="lg:hidden p-3 border-t border-bg-elevated">
        <Button variant="primary" size="md" className="w-full" onClick={() => setMobileTab('code')}>
          Abrir Editor →
        </Button>
      </div>
    </div>
  );

  const editorPanel = (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {successStars !== null && (
        <SuccessOverlay
          lesson={exercise}
          stars={successStars}
          onNext={handleNext}
          onMap={() => navigate('/')}
        />
      )}

      <div className="flex items-center justify-between px-4 py-2 border-b border-bg-elevated bg-bg-surface flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileTab('instructions')}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-[#8888AA] hover:text-[#E8E8F0] hover:bg-bg-elevated transition-colors"
          >
            ←
          </button>
          <span className="font-mono text-xs text-[#8888AA]">student.ts</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCode(exercise.starterCode);
              runner.reset();
              setEditorBorderStatus('idle');
            }}
            className="text-xs"
          >
            Resetar
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={runner.status === 'running'}
            onClick={handleRun}
            className="min-w-28"
          >
            {runner.status === 'running' ? 'Executando...' : '▶ Executar'}
          </Button>
        </div>
      </div>

      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [-4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.3 }}
        className={`flex-1 min-h-0 border-b transition-colors ${editorBorderClass}`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full bg-[#0A0A15]">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#8888AA] font-mono">Carregando editor...</p>
              </div>
            </div>
          }
        >
          <MonacoEditor
            height="100%"
            language="typescript"
            value={code}
            onChange={(v) => setCode(v ?? '')}
            beforeMount={defineCodeQuestTheme}
            theme="codequest-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: '"JetBrains Mono", monospace',
              fontLigatures: true,
              padding: { top: 16, bottom: 16 },
              tabSize: 2,
              wordWrap: 'on',
              renderLineHighlight: 'line',
              smoothScrolling: true,
            }}
          />
        </Suspense>
      </motion.div>

      <div className="p-3 bg-bg-primary border-t border-bg-elevated flex-shrink-0">
        <OutputPanel
          output={runner.output}
          errorMessage={runner.errorMessage}
          mistakeMessage={runner.mistakeMessage}
          status={runner.status}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      <Modal open={noLivesModal} onClose={() => setNoLivesModal(false)} title="Sem vidas! 💔">
        <p className="text-[#8888AA] font-body text-sm mb-6 leading-relaxed">
          Você ficou sem vidas. Espere <strong className="text-[#E8E8F0]">30 minutos</strong> para
          regenerar ou revise exercícios anteriores. Você também pode desativar o sistema de vidas
          nas configurações.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={() => navigate('/')}>
            Voltar ao Mapa
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={() => navigate('/settings')}>
            Configurações
          </Button>
        </div>
      </Modal>

      {/* Desktop: side-by-side. Mobile: toggle between panels */}
      <div className="hidden lg:flex lg:flex-row flex-1 overflow-hidden">
        {instructionsPanel}
        {editorPanel}
      </div>
      <div className="flex flex-col flex-1 overflow-hidden lg:hidden">
        {mobileTab === 'instructions' ? instructionsPanel : editorPanel}
      </div>
    </div>
  );
}
