import type { Curriculum, Module, AchievementsFile } from './curriculum.types';

const BASE = '/content';

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function loadCurriculum(): Promise<Curriculum> {
  return fetchJSON<Curriculum>('curriculum.json');
}

export async function loadModule(file: string): Promise<Module> {
  return fetchJSON<Module>(file);
}

export async function loadAchievements(): Promise<AchievementsFile> {
  return fetchJSON<AchievementsFile>('achievements.json');
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
