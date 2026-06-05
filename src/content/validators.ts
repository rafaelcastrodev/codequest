import type { Curriculum, Module, AchievementsFile } from './curriculum.types';

function assert(condition: boolean, message: string): void {
  if (!condition) console.warn(`[Schema Validation] ${message}`);
}

export function validateCurriculum(data: unknown): data is Curriculum {
  if (!data || typeof data !== 'object') return false;
  const c = data as Record<string, unknown>;
  assert(typeof c.version === 'string', 'curriculum.version must be string');
  assert(Array.isArray(c.modules), 'curriculum.modules must be array');
  return true;
}

export function validateModule(data: unknown): data is Module {
  if (!data || typeof data !== 'object') return false;
  const m = data as Record<string, unknown>;
  assert(typeof m.id === 'string', 'module.id must be string');
  assert(typeof m.title === 'string', 'module.title must be string');
  assert(Array.isArray(m.lessons), 'module.lessons must be array');
  return true;
}

export function validateAchievements(data: unknown): data is AchievementsFile {
  if (!data || typeof data !== 'object') return false;
  const a = data as Record<string, unknown>;
  assert(Array.isArray(a.achievements), 'achievements.achievements must be array');
  return true;
}
