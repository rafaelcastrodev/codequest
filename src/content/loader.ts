import type { Curriculum, Module, AchievementsFile } from './curriculum.types';
import { validateCurriculum, validateModule, validateAchievements } from './validators';

const BASE = '/content';

const cache = new Map<string, unknown>();

async function fetchJSON<T>(path: string): Promise<T> {
  const cached = cache.get(path) as T | undefined;
  if (cached) return cached;
  const headers: RequestInit = import.meta.env.DEV ? { cache: 'no-cache' } : {};
  const res = await fetch(`${BASE}/${path}`, headers);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`);
  const data = await (res.json() as Promise<T>);
  cache.set(path, data);
  return data;
}

export async function loadCurriculum(): Promise<Curriculum> {
  const data = await fetchJSON<Curriculum>('curriculum.json');
  if (!validateCurriculum(data)) {
    throw new Error('curriculum.json has invalid schema');
  }
  return data;
}

export async function loadModule(file: string): Promise<Module> {
  const data = await fetchJSON<Module>(file);
  if (!validateModule(data)) {
    throw new Error(`${file} has invalid schema`);
  }
  return data;
}

export async function loadAchievements(): Promise<AchievementsFile> {
  const data = await fetchJSON<AchievementsFile>('achievements.json');
  if (!validateAchievements(data)) {
    throw new Error('achievements.json has invalid schema');
  }
  return data;
}

export function clearContentCache(): void {
  cache.clear();
}

export async function loadAllModules(curriculum: Curriculum): Promise<Map<string, Module>> {
  const entries = await Promise.all(
    curriculum.modules.map(async (m) => {
      const mod = await loadModule(m.file);
      return [m.id, mod] as [string, Module];
    }),
  );
  return new Map(entries);
}
