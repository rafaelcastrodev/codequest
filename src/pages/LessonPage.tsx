import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { loadModule } from '@/content/loader';
import { useProgressStore } from '@/store/progress.store';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { RichText } from '@/components/ui/RichText';
import type { Module, TheoryLesson, LessonStep } from '@/content/curriculum.types';

interface StepViewProps {
  step: LessonStep;
}

function StepView({ step }: StepViewProps) {
  if (step.type === 'explanation') {
    return <RichText content={step.content} className="text-[#E8E8F0] font-body leading-relaxed text-base" />;
  }

  return (
    <div className="space-y-3">
      <CodeBlock code={step.code} />
      <p className="text-[#8888AA] font-body text-sm leading-relaxed">{step.explanation}</p>
    </div>
  );
}

interface LessonCompleteProps {
  lesson: TheoryLesson;
  onNext: () => void;
  onMap: () => void;
}

function LessonComplete({ lesson, onNext, onMap }: LessonCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="text-center space-y-6 py-4"
    >
      <div className="text-5xl">✅</div>
      <div>
        <h2 className="font-heading font-bold text-2xl text-primary mb-1">Teoria concluída!</h2>
        <p className="text-[#8888AA] font-body text-sm">{lesson.title}</p>
      </div>
      <div className="inline-block bg-secondary/20 border border-secondary/30 rounded-xl px-6 py-2.5">
        <span className="font-heading font-bold text-secondary text-xl">+{lesson.xpReward} XP</span>
      </div>
      <div className="flex gap-3 justify-center">
        <Button variant="ghost" size="md" className="w-32" onClick={onMap}>
          🗺️ Mapa
        </Button>
        <Button variant="primary" size="md" className="w-40" onClick={onNext}>
          Continuar →
        </Button>
      </div>
    </motion.div>
  );
}

export function LessonPage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { addXP, completeExercise, updateStreak } = useProgressStore();

  const [mod, setMod] = useState<Module | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const xpAwarded = useRef(false);

  useEffect(() => {
    if (!moduleId) return;
    setLoading(true);
    setStepIndex(0);
    setCompleted(false);
    xpAwarded.current = false;
    loadModule(`modules/${moduleId}.json`)
      .then(setMod)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const lesson = mod?.lessons.find((l) => l.id === lessonId);

  if (!lesson || lesson.type !== 'theory') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#8888AA] font-body">Lição não encontrada.</p>
      </div>
    );
  }

  const theoryLesson = lesson as TheoryLesson;
  const steps = theoryLesson.steps;
  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];

  const lessons = mod?.lessons ?? [];
  const currentIdx = lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = lessons[currentIdx + 1];

  function handleComplete() {
    if (!xpAwarded.current && theoryLesson) {
      addXP(theoryLesson.xpReward);
      completeExercise(theoryLesson.id, 3, 0);
      updateStreak();
      xpAwarded.current = true;
    }
    setCompleted(true);
  }

  function handleNext() {
    if (nextLesson && moduleId) {
      const path =
        nextLesson.type === 'exercise' || nextLesson.type === 'challenge'
          ? `/exercise/${moduleId}/${nextLesson.id}`
          : nextLesson.type === 'quiz'
          ? `/quiz/${moduleId}/${nextLesson.id}`
          : `/lesson/${moduleId}/${nextLesson.id}`;
      navigate(path);
    } else {
      navigate('/');
    }
  }

  function handleNext_step() {
    if (stepIndex < totalSteps - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleComplete();
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {!completed && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8888AA] font-body">Passo {stepIndex + 1} de {totalSteps}</span>
            <span className="text-xs font-semibold text-primary font-body">{lesson.title}</span>
          </div>
          <ProgressBar value={stepIndex + 1} max={totalSteps} variant="primary" size="sm" />
        </div>
      )}

      <div className="bg-bg-surface border border-bg-elevated rounded-2xl p-6 min-h-48">
        {completed ? (
          <LessonComplete
            lesson={theoryLesson}
            onNext={handleNext}
            onMap={() => navigate('/')}
          />
        ) : (
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep && <StepView step={currentStep} />}
          </motion.div>
        )}
      </div>

      {!completed && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="md"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex(stepIndex - 1)}
          >
            ← Anterior
          </Button>
          <Button variant="primary" size="md" onClick={handleNext_step}>
            {stepIndex < totalSteps - 1 ? 'Próximo →' : 'Concluir ✓'}
          </Button>
        </div>
      )}
    </div>
  );
}
