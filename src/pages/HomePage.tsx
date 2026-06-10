import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadCurriculum, loadModule } from '@/content/loader';
import { useProgressStore, getModuleMastery } from '@/store/progress.store';
import type { ModuleMastery } from '@/store/progress.store';
import { useSettingsStore } from '@/store/settings.store';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MasteryBadge } from '@/components/ui/MasteryBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { icons } from '@/components/ui/Icon';
import { lessonPath } from '@/utils/lesson-path';
import type { ReactNode } from 'react';
import type { Curriculum, Module, Lesson } from '@/content/curriculum.types';

const lessonTypeLabel: Record<string, ReactNode> = {
  theory: <><icons.book /> Teoria</>,
  exercise: <><icons.laptop /> Exercício</>,
  challenge: <><icons.trophy /> Desafio</>,
  quiz: <>❓ Quiz</>,
};

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  total: number;
  completed: boolean;
  isNext: boolean;
  onGo: () => void;
}

function LessonItem({ lesson, index, total, completed, isNext, onGo }: LessonItemProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onGo}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
        ${isNext ? 'bg-primary/10 border border-primary/30' : 'hover:bg-bg-elevated/60'}
      `}
    >
      <span className={`
        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
        ${completed ? 'bg-primary/20 text-primary' : isNext ? 'bg-primary text-bg-primary' : 'bg-bg-elevated text-text-muted'}
      `}>
        {completed ? <icons.check /> : index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-body truncate ${completed ? 'text-text-muted' : 'text-text-main'}`}>
          {lesson.title}
        </p>
        <p className="text-xs text-text-muted/70 font-body">
          {lessonTypeLabel[lesson.type] ?? lesson.type} · {index + 1}/{total}
        </p>
      </div>
      {isNext && (
        <span className="text-xs text-primary font-body font-semibold flex-shrink-0 flex items-center gap-1">Continuar <icons.arrowRight /></span>
      )}
    </motion.button>
  );
}

interface ModuleNodeProps {
  moduleData: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    prerequisites: string[];
  };
  mod: Module | null;
  unlocked: boolean;
  completedCount: number;
  totalLessons: number;
  mastery: ModuleMastery;
  completedExercises: Record<string, unknown>;
  expanded: boolean;
  onToggle: () => void;
  onGoLesson: (lesson: Lesson) => void;
}

function ModuleNode({ moduleData, mod, unlocked, completedCount, totalLessons, mastery, completedExercises, expanded, onToggle, onGoLesson }: ModuleNodeProps) {
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const firstUncompleted = mod?.lessons.find((l) => !completedExercises[l.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative w-full max-w-sm mx-auto rounded-2xl border transition-colors overflow-hidden
        ${unlocked
          ? 'bg-bg-surface border-bg-elevated'
          : 'bg-bg-surface/50 border-bg-elevated/50 opacity-60'
        }
      `}
    >
      <div
        onClick={unlocked ? onToggle : undefined}
        className={`p-5 ${unlocked ? 'cursor-pointer hover:bg-bg-elevated/30' : 'cursor-not-allowed'} transition-colors`}
      >
        {mastery.level > 0 && <div className="mb-3"><MasteryBadge mastery={mastery} /></div>}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              backgroundColor: unlocked ? `${moduleData.color}22` : '#252542',
              borderColor: unlocked ? moduleData.color : '#252542',
              borderWidth: 1,
            }}
          >
            {unlocked ? moduleData.icon : <icons.lock />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-text-main truncate">{moduleData.title}</h3>
            <p className="text-xs text-text-muted font-body mt-0.5 line-clamp-2">{moduleData.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {unlocked && percent === 100 && <span className="text-xl"><icons.checkCircle /></span>}
            {unlocked && (
              <span className={`text-text-muted text-sm transition-transform ${expanded ? 'rotate-180' : ''}`}>
                <icons.chevronSmDown />
              </span>
            )}
          </div>
        </div>

        {unlocked && totalLessons > 0 && (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-text-muted font-body">{completedCount}/{totalLessons} lições</span>
              <span className="text-xs font-semibold font-body" style={{ color: moduleData.color }}>
                <icons.star /> {mastery.earnedStars}/{mastery.maxStars}
              </span>
            </div>
            <ProgressBar value={mastery.earnedStars} max={mastery.maxStars} variant="primary" size="sm" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && unlocked && mod && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-bg-elevated/50 space-y-0.5">
              {mod.lessons.map((lesson, i) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={i}
                  total={mod.lessons.length}
                  completed={!!completedExercises[lesson.id]}
                  isNext={lesson.id === firstUncompleted?.id}
                  onGo={() => onGoLesson(lesson)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { unlockedModules, completedExercises, unlockModule } = useProgressStore();
  const debugMode = useSettingsStore((s) => s.debugMode);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [modules, setModules] = useState<Map<string, Module>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedModules, setFailedModules] = useState<string[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    loadCurriculum()
      .then(async (c) => {
        setCurriculum(c);
        const loaded = await Promise.allSettled(
          c.modules.map(async (m) => {
            const mod = await loadModule(m.file);
            return [m.id, mod] as [string, Module];
          }),
        );
        const map = new Map<string, Module>();
        const failed: string[] = [];
        loaded.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            map.set(r.value[0], r.value[1]);
          } else {
            failed.push(c.modules[i]!.title);
          }
        });
        setModules(map);
        setFailedModules(failed);

        const activeModule = c.modules.find((m) => {
          if (!debugMode && !unlockedModules.includes(m.id)) return false;
          const mod = map.get(m.id);
          return mod?.lessons.some((l) => !completedExercises[l.id]);
        });
        if (activeModule) setExpandedModule(activeModule.id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao carregar conteúdo'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount; reactive unlock is handled by the effect below
  }, []);

  // Auto-unlock modules when prerequisites are completed
  useEffect(() => {
    if (!curriculum || modules.size === 0) return;

    for (const cm of curriculum.modules) {
      if (unlockedModules.includes(cm.id)) continue;
      if (cm.prerequisites.length === 0) continue;

      const allMet = cm.prerequisites.every((prereqId) => {
        const prereqMod = modules.get(prereqId);
        return prereqMod?.lessons.some((l) => completedExercises[l.id]);
      });

      if (allMet) unlockModule(cm.id);
    }
  }, [curriculum, modules, completedExercises, unlockedModules, unlockModule]);

  if (loading) {
    return <LoadingSpinner size="lg" message="Carregando missões..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <icons.warning className="text-4xl" />
          <p className="text-accent font-body">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading font-bold text-3xl text-text-main mb-2"
        >
          <icons.bolt /> Sua Jornada
        </motion.h1>
        <p className="text-text-muted font-body text-sm">
          Complete as missões para dominar o TypeScript!
        </p>
      </div>

      {failedModules.length > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 text-center">
          <p className="text-accent font-body text-sm">
            <icons.warning /> Não foi possível carregar: {failedModules.join(', ')}
          </p>
        </div>
      )}

      <div className="relative space-y-4">
        {curriculum?.modules.map((m, i) => {
          const mod = modules.get(m.id) ?? null;
          const unlocked = debugMode || unlockedModules.includes(m.id);
          const totalLessons = mod?.lessons.length ?? 0;
          const completedCount = mod
            ? mod.lessons.filter((l) => completedExercises[l.id]).length
            : 0;
          const mastery = getModuleMastery(mod?.lessons ?? [], completedExercises);

          return (
            <div key={m.id} className="relative">
              {i < (curriculum.modules.length - 1) && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-4 bg-bg-elevated z-0" />
              )}
              <ModuleNode
                moduleData={m}
                mod={mod}
                unlocked={unlocked}
                completedCount={completedCount}
                totalLessons={totalLessons}
                mastery={mastery}
                completedExercises={completedExercises}
                expanded={expandedModule === m.id}
                onToggle={() => setExpandedModule(expandedModule === m.id ? null : m.id)}
                onGoLesson={(lesson) => navigate(lessonPath(m.id, lesson))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
