import { lazy, Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useExercise } from '@/hooks/useExercise';
import { useCodeRunner } from '@/hooks/useCodeRunner';
import { useProgressStore } from '@/store/progress.store';
import { useSessionStore } from '@/store/session.store';
import { useSettingsStore } from '@/store/settings.store';
import { useAchievements } from '@/hooks/useAchievements';
import { useAssistant } from '@/hooks/useAssistant';
import {
  FakeAssistantButton,
  FakeAssistantModal,
  AssistantContentNav,
} from '@/components/lesson/FakeAssistant';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { RichText } from '@/components/ui/RichText';
import { HintPanel } from '@/components/exercise/HintPanel';
import { OutputPanel } from '@/components/exercise/OutputPanel';
import { SuccessOverlay } from '@/components/exercise/SuccessOverlay';
import { defineCodeQuestTheme } from '@/engine/monaco-theme';
import { triggerConfetti } from '@/utils/confetti';
import { playSound } from '@/utils/sounds';
import { lessonPath } from '@/utils/lesson-path';

const MonacoEditor = lazy(() => import('@monaco-editor/react').then((m) => ({ default: m.Editor })));

function isCodeContent(content: string): boolean {
  return content.includes('\n') && (
    content.includes('let ') ||
    content.includes('const ') ||
    content.includes('function ') ||
    content.includes('console.log') ||
    content.includes('=>')
  );
}

export function ExercisePage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const navigate = useNavigate();

  const { module: mod, exercise, loading, error } = useExercise(moduleId, lessonId);
  const runner = useCodeRunner();
  const { addXP, completeExercise, updateStreak, completedExercises } = useProgressStore();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const debugMode = useSettingsStore((s) => s.debugMode);
  const { hintsUsed, useHint, setCurrentLesson } = useSessionStore();
  const { checkAndUnlock } = useAchievements();

  const assistant = useAssistant(moduleId, lessonId);

  const [code, setCode] = useState('');
  const [successStars, setSuccessStars] = useState<number | null>(null);
  const [editorBorderStatus, setEditorBorderStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [shakeKey, setShakeKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<'instructions' | 'code'>('instructions');
  const pendingAchievementCheck = useRef(false);

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

  useEffect(() => {
    if (pendingAchievementCheck.current) {
      pendingAchievementCheck.current = false;
      checkAndUnlock();
    }
  }, [completedExercises, checkAndUnlock]);

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
      pendingAchievementCheck.current = true;
    } else if (outcome.type === 'failed' || outcome.type === 'error') {
      setEditorBorderStatus('err');
      setShakeKey((k) => k + 1);
      if (soundEnabled) playSound('error');
    }
  }, [exercise, runner, code, hintsUsed, addXP, completeExercise, completedExercises, updateStreak, soundEnabled]);

  const handleNext = useCallback(() => {
    if (!mod || !moduleId) return navigate('/');
    const lessons = mod.lessons;
    const idx = lessons.findIndex((l) => l.id === lessonId);
    const next = lessons[idx + 1];
    if (!next) return navigate('/');
    navigate(lessonPath(moduleId, next));
  }, [mod, moduleId, lessonId, navigate]);

  const handleSkip = useCallback(() => {
    if (!exercise) return;
    completeExercise(exercise.id, 1, 0);
    handleNext();
  }, [exercise, completeExercise, handleNext]);

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

  const lessons = mod?.lessons ?? [];
  const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
  const totalLessons = lessons.length;

  const editorBorderClass =
    editorBorderStatus === 'ok'
      ? 'border-primary/50'
      : editorBorderStatus === 'err'
      ? 'border-accent/50'
      : 'border-transparent';

  const slideVariants = {
    enterFromRight: { opacity: 0, x: 40 },
    enterFromLeft: { opacity: 0, x: -40 },
    center: { opacity: 1, x: 0 },
  };

  const instructionsPanel = (
    <div className="flex-1 lg:flex-initial lg:w-80 xl:w-96 flex-shrink-0 border-r border-bg-elevated bg-bg-surface flex flex-col overflow-hidden">
      <div className="px-5 pt-3 pb-2 border-b border-bg-elevated/50 flex items-center justify-between">
        <span className="text-xs text-[#8888AA] font-body truncate">
          {mod?.title} — Lição {lessonIndex + 1} de {totalLessons}
        </span>
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          ✕ Sair
        </Button>
      </div>
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
        <AssistantContentNav
          showingAssistant={assistant.showingAssistant}
          hasAssistantContent={assistant.activeContent !== null}
          activeAction={assistant.activeAction}
          onShowOriginal={assistant.showOriginal}
          onShowAssistant={assistant.showAssistantView}
        />

        <AnimatePresence mode="wait">
          {assistant.showingAssistant && assistant.activeContent ? (
            <motion.div
              key={`assistant-${assistant.activeContent}`}
              variants={slideVariants}
              initial="enterFromRight"
              animate="center"
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
              className="bg-bg-elevated rounded-xl p-4 space-y-2"
            >
              {isCodeContent(assistant.activeContent) ? (
                <CodeBlock code={assistant.activeContent} />
              ) : (
                <RichText
                  content={assistant.activeContent}
                  className="font-body text-sm text-[#E8E8F0] leading-relaxed"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="original-instructions"
              variants={slideVariants}
              initial="enterFromLeft"
              animate="center"
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-bg-elevated rounded-xl p-4">
                <p className="font-body text-sm text-[#E8E8F0] leading-relaxed whitespace-pre-wrap">
                  {exercise.instructions}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {exercise.hints.length > 0 && (
          <HintPanel hints={exercise.hints} hintsUsed={hintsUsed} onUseHint={useHint} />
        )}
      </div>

      <div className="p-3 border-t border-bg-elevated flex justify-end">
        <FakeAssistantButton
          hasContent={assistant.hasContent}
          showingAssistant={assistant.showingAssistant}
          onClick={assistant.openModal}
        />
      </div>

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
            aria-label="Voltar às instruções"
            onClick={() => setMobileTab('instructions')}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-[#8888AA] hover:text-[#E8E8F0] hover:bg-bg-elevated transition-colors"
          >
            <span aria-hidden="true">←</span>
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
          {debugMode && (
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs text-warning">
              Pular ⏭
            </Button>
          )}
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
              quickSuggestions: false,
              suggestOnTriggerCharacters: false,
              parameterHints: { enabled: false },
              wordBasedSuggestions: 'off',
              tabCompletion: 'off',
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
    <>
      <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        <div className="hidden lg:flex lg:flex-row flex-1 overflow-hidden">
          {instructionsPanel}
          {editorPanel}
        </div>
        <div className="flex flex-col flex-1 overflow-hidden lg:hidden">
          {mobileTab === 'instructions' ? instructionsPanel : editorPanel}
        </div>
      </div>

      <FakeAssistantModal
        open={assistant.modalOpen}
        onClose={assistant.closeModal}
        onRequest={assistant.request}
      />
    </>
  );
}
