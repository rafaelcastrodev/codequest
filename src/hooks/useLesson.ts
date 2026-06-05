import { useState, useEffect } from 'react';
import { loadModule } from '@/content/loader';
import type { Module, Lesson } from '@/content/curriculum.types';

interface UseLessonResult {
  module: Module | null;
  lesson: Lesson | undefined;
  loading: boolean;
  error: string | null;
}

export function useLesson(moduleId: string | undefined, lessonId: string | undefined): UseLessonResult {
  const [mod, setMod] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadModule(`modules/${moduleId}.json`)
      .then(setMod)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao carregar módulo'))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const lesson = mod?.lessons.find((l) => l.id === lessonId);
  return { module: mod, lesson, loading, error };
}
