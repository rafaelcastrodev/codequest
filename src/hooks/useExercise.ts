import { useLesson } from './useLesson';
import type { ExerciseLesson } from '@/content/curriculum.types';

export function useExercise(moduleId: string | undefined, lessonId: string | undefined) {
  const { module: mod, lesson, loading, error } = useLesson(moduleId, lessonId);
  const exercise =
    lesson && (lesson.type === 'exercise' || lesson.type === 'challenge')
      ? (lesson as ExerciseLesson)
      : null;

  return { module: mod, exercise, loading, error };
}
