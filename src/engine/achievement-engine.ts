import type { Achievement, Module } from '@/content/curriculum.types';
import type { CompletedExercise } from '@/store/progress.store';

export interface ProgressSnapshot {
  xp: number;
  streak: { current: number };
  completedExercises: Record<string, CompletedExercise>;
  achievements: string[];
}

function isModuleComplete(moduleId: string, modules: Map<string, Module>, completed: Record<string, CompletedExercise>): boolean {
  const mod = modules.get(moduleId);
  if (!mod) return false;
  return mod.lessons
    .filter((l) => l.type !== 'theory')
    .every((l) => completed[l.id] !== undefined);
}

function isModulePerfect(moduleId: string, minStars: number, modules: Map<string, Module>, completed: Record<string, CompletedExercise>): boolean {
  const mod = modules.get(moduleId);
  if (!mod) return false;
  const gradedLessons = mod.lessons.filter((l) => l.type !== 'theory');
  if (gradedLessons.length === 0) return false;
  return gradedLessons.every((l) => (completed[l.id]?.stars ?? 0) >= minStars);
}

function countAllQuizIds(modules: Map<string, Module>): string[] {
  const ids: string[] = [];
  for (const mod of modules.values()) {
    for (const lesson of mod.lessons) {
      if (lesson.type === 'quiz') ids.push(lesson.id);
    }
  }
  return ids;
}

export function checkAchievement(
  achievement: Achievement,
  state: ProgressSnapshot,
  modules: Map<string, Module>,
): boolean {
  if (state.achievements.includes(achievement.id)) return false;

  const { condition } = achievement;
  const { completedExercises, xp, streak } = state;

  switch (condition.type) {
    case 'exercise-complete':
      return condition.exerciseId !== undefined && completedExercises[condition.exerciseId] !== undefined;

    case 'module-complete':
      return condition.moduleId !== undefined && isModuleComplete(condition.moduleId, modules, completedExercises);

    case 'exercises-no-hints': {
      const noHintCount = Object.values(completedExercises).filter((e) => e.hintsUsed === 0).length;
      return noHintCount >= (condition.count ?? 1);
    }

    case 'module-perfect':
      return condition.moduleId !== undefined
        ? isModulePerfect(condition.moduleId, condition.minStars ?? 3, modules, completedExercises)
        : Array.from(modules.keys()).some((id) =>
            isModulePerfect(id, condition.minStars ?? 3, modules, completedExercises),
          );

    case 'streak':
      return streak.current >= (condition.days ?? 1);

    case 'xp-total':
      return xp >= (condition.amount ?? 0);

    case 'exercise-first-attempt': {
      const firstAttemptCount = Object.values(completedExercises).filter((e) => e.attempts === 1).length;
      return firstAttemptCount >= (condition.count ?? 1);
    }

    case 'all-quizzes-complete': {
      const allQuizIds = countAllQuizIds(modules);
      return allQuizIds.length > 0 && allQuizIds.every((id) => completedExercises[id] !== undefined);
    }

    default:
      return false;
  }
}

export function findNewlyUnlocked(
  achievements: Achievement[],
  state: ProgressSnapshot,
  modules: Map<string, Module>,
): Achievement[] {
  return achievements.filter((a) => checkAchievement(a, state, modules));
}
