import type { AssistantModule, AssistantEntry } from './assistant.types';

const BASE = '/content/assistant';
const cache = new Map<string, AssistantModule>();

export async function loadAssistantModule(moduleId: string): Promise<AssistantModule> {
  const cached = cache.get(moduleId);
  if (cached) return cached;

  const headers: RequestInit = import.meta.env.DEV ? { cache: 'no-cache' } : {};
  const res = await fetch(`${BASE}/${moduleId}.json`, headers);
  if (!res.ok) throw new Error(`Failed to load assistant data for ${moduleId}`);

  const data = await (res.json() as Promise<AssistantModule>);
  cache.set(moduleId, data);
  return data;
}

export function getAssistantEntry(
  assistantModule: AssistantModule,
  lessonId: string,
): AssistantEntry | null {
  return assistantModule.lessons[lessonId] ?? null;
}
