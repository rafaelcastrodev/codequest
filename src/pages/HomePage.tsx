import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadCurriculum, loadModule } from '@/content/loader';
import { useProgressStore } from '@/store/progress.store';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Curriculum, Module } from '@/content/curriculum.types';

function lessonPath(moduleId: string, lesson: { id: string; type: string }): string {
  if (lesson.type === 'exercise' || lesson.type === 'challenge') {
    return `/exercise/${moduleId}/${lesson.id}`;
  }
  if (lesson.type === 'quiz') {
    return `/quiz/${moduleId}/${lesson.id}`;
  }
  return `/lesson/${moduleId}/${lesson.id}`;
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
  onEnter: () => void;
}

function ModuleNode({ moduleData, unlocked, completedCount, totalLessons, onEnter }: ModuleNodeProps) {
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={unlocked ? { scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={unlocked ? onEnter : undefined}
      className={`
        relative w-full max-w-sm mx-auto rounded-2xl border p-5 transition-colors
        ${unlocked
          ? 'bg-bg-surface border-bg-elevated cursor-pointer hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,212,170,0.1)]'
          : 'bg-bg-surface/50 border-bg-elevated/50 cursor-not-allowed opacity-60'
        }
      `}
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
        {unlocked && percent === 100 && (
          <span className="text-xl flex-shrink-0">✅</span>
        )}
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
        loaded.forEach((r) => {
          if (r.status === 'fulfilled') map.set(r.value[0], r.value[1]);
        });
        setModules(map);
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
                onEnter={() => {
                  if (!mod) return;
                  // Go to first uncompleted lesson; fall back to first lesson
                  const firstUncompleted = mod.lessons.find((l) => !completedExercises[l.id]);
                  const target = firstUncompleted ?? mod.lessons[0];
                  if (target) navigate(lessonPath(m.id, target));
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
