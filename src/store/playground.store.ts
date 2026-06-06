import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlaygroundSnippet {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaygroundTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  code: string;
}

export const PLAYGROUND_TEMPLATES: PlaygroundTemplate[] = [];

interface PlaygroundState {
  snippets: PlaygroundSnippet[];
  saveSnippet: (name: string, code: string) => string;
  updateSnippetCode: (id: string, code: string) => void;
  renameSnippet: (id: string, name: string) => void;
  deleteSnippet: (id: string) => void;
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set, get) => ({
      snippets: [],

      saveSnippet: (name: string, code: string) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const snippet: PlaygroundSnippet = { id, name, code, createdAt: now, updatedAt: now };
        set({ snippets: [...get().snippets, snippet] });
        return id;
      },

      updateSnippetCode: (id: string, code: string) => {
        set({
          snippets: get().snippets.map((s) =>
            s.id === id ? { ...s, code, updatedAt: new Date().toISOString() } : s,
          ),
        });
      },

      renameSnippet: (id: string, name: string) => {
        set({
          snippets: get().snippets.map((s) =>
            s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s,
          ),
        });
      },

      deleteSnippet: (id: string) => {
        set({ snippets: get().snippets.filter((s) => s.id !== id) });
      },
    }),
    { name: 'codequest-playground' },
  ),
);
