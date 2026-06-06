import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadCurriculum, loadModule } from '@/content/loader';
import { useProgressStore } from '@/store/progress.store';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { lessonPath } from '@/utils/lesson-path';
import type { Curriculum, Module, Lesson } from '@/content/curriculum.types';

const lessonTypeLabel: Record<string, string> = {
  theory: '📖 Teoria',
  exercise: '💻 Exercício',
  challenge: '🏆 Desafio',
  quiz: '❓ Quiz',
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
        ${completed ? 'bg-primary/20 text-primary' : isNext ? 'bg-primary text-bg-primary' : 'bg-bg-elevated text-[#8888AA]'}
      `}>
        {completed ? '✓' : index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-body truncate ${completed ? 'text-[#8888AA]' : 'text-[#E8E8F0]'}`}>
          {lesson.title}
        </p>
        <p className="text-xs text-[#8888AA]/70 font-body">
          {lessonTypeLabel[lesson.type] ?? lesson.type} · {index + 1}/{total}
        </p>
      </div>
      {isNext && (
        <span className="text-xs text-primary font-body font-semibold flex-shrink-0">Continuar →</span>
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
  completedExercises: Record<string, unknown>;
  expanded: boolean;
  onToggle: () => void;
  onGoLesson: (lesson: Lesson) => void;
}

function ModuleNode({ moduleData, mod, unlocked, completedCount, totalLessons, completedExercises, expanded, onToggle, onGoLesson }: ModuleNodeProps) {
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
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              backgroundColor: unlocked ? `${moduleData.color}22` : '#252542',
              borderColor: unlocked ? moduleData.color : '#252542',
              borderWidth: 1,
            }}
          >
            {unlocked ? moduleData.icon : '🔒'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-[#E8E8F0] truncate">{moduleData.title}</h3>
            <p className="text-xs text-[#8888AA] font-body mt-0.5 line-clamp-2">{moduleData.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {unlocked && percent === 100 && <span className="text-xl">✅</span>}
            {unlocked && (
              <span className={`text-[#8888AA] text-sm transition-transform ${expanded ? 'rotate-180' : ''}`}>
                ▾
              </span>
            )}
          </div>
        </div>

        {unlocked && totalLessons > 0 && (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-[#8888AA] font-body">{completedCount}/{totalLessons} lições</span>
              <span className="text-xs font-semibold font-body" style={{ color: moduleData.color }}>{percent}%</span>
            </div>
            <ProgressBar value={percent} max={100} variant="primary" size="sm" />
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
          if (!unlockedModules.includes(m.id)) return false;
          const mod = map.get(m.id);
          return mod?.lessons.some((l) => !completedExercises[l.id]);
        });
        if (activeModule) setExpandedModule(activeModule.id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao carregar conteúdo'))
      .finally(() => setLoading(false));
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
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#8888AA] font-body">Carregando missões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <span className="text-4xl">⚠️</span>
          <p className="text-accent font-body">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading font-bold text-3xl text-[#E8E8F0] mb-2"
        >
          ⚡ Sua Jornada
        </motion.h1>
        <p className="text-[#8888AA] font-body text-sm">
          Complete as missões para dominar o TypeScript!
        </p>
      </div>

      {failedModules.length > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 text-center">
          <p className="text-accent font-body text-sm">
            ⚠️ Não foi possível carregar: {failedModules.join(', ')}
          </p>
        </div>
      )}

      <div className="relative space-y-4">
        {curriculum?.modules.map((m, i) => {
          const mod = modules.get(m.id) ?? null;
          const unlocked = unlockedModules.includes(m.id);
          const totalLessons = mod?.lessons.length ?? 0;
          const completedCount = mod
            ? mod.lessons.filter((l) => completedExercises[l.id]).length
            : 0;

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
