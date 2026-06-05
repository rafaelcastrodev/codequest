import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadCurriculum, loadModule, loadAchievements, clearContentCache } from '@/content/loader';

const mockCurriculum = {
  version: '1.0',
  language: 'pt-BR',
  title: 'CodeQuest',
  description: 'Learn TS',
  modules: [
    { id: 'mod-1', title: 'Module 1', description: '', icon: '📦', color: '#00D4AA', file: 'modules/mod-1.json', prerequisites: [], estimatedMinutes: 30 },
  ],
};

const mockModule = {
  id: 'mod-1',
  title: 'Module 1',
  description: 'A test module',
  lessons: [],
};

const mockAchievements = {
  achievements: [
    { id: 'a1', title: 'First!', description: '', icon: '🏆', rarity: 'common', condition: { type: 'xp-total', amount: 50 } },
  ],
};

beforeEach(() => {
  vi.restoreAllMocks();
  clearContentCache();
});

describe('loadCurriculum', () => {
  it('fetches and returns curriculum.json', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockCurriculum), { status: 200 }),
    );
    const result = await loadCurriculum();
    expect(result.version).toBe('1.0');
    expect(result.modules).toHaveLength(1);
  });

  it('throws on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 404, statusText: 'Not Found' }),
    );
    await expect(loadCurriculum()).rejects.toThrow('Failed to load');
  });
});

describe('loadModule', () => {
  it('fetches and returns a module JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockModule), { status: 200 }),
    );
    const result = await loadModule('modules/mod-1.json');
    expect(result.id).toBe('mod-1');
    expect(result.lessons).toEqual([]);
  });
});

describe('loadAchievements', () => {
  it('fetches and returns achievements.json', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockAchievements), { status: 200 }),
    );
    const result = await loadAchievements();
    expect(result.achievements).toHaveLength(1);
    expect(result.achievements[0].id).toBe('a1');
  });
});
