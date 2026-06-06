import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadAssistantModule } from '@/content/assistant-loader';
import type { AssistantEntry } from '@/content/assistant.types';

export type AssistantAction = 'explain' | 'examples' | 'summary';

interface AssistantState {
  entry: AssistantEntry | null;
  loading: boolean;
  counters: Record<AssistantAction, number>;
  activeContent: string | null;
  activeAction: AssistantAction | null;
  modalOpen: boolean;
  showingAssistant: boolean;
}

export interface UseAssistantReturn {
  loading: boolean;
  hasContent: boolean;
  modalOpen: boolean;
  showingAssistant: boolean;
  activeContent: string | null;
  activeAction: AssistantAction | null;
  openModal: () => void;
  closeModal: () => void;
  request: (action: AssistantAction) => void;
  showOriginal: () => void;
  showAssistantView: () => void;
  clearAssistant: () => void;
}

export function useAssistant(moduleId: string | undefined, lessonId: string | undefined): UseAssistantReturn {
  const [state, setState] = useState<AssistantState>({
    entry: null,
    loading: true,
    counters: { explain: 0, examples: 0, summary: 0 },
    activeContent: null,
    activeAction: null,
    modalOpen: false,
    showingAssistant: false,
  });

  useEffect(() => {
    if (!moduleId || !lessonId) return;

    setState({
      entry: null,
      loading: true,
      counters: { explain: 0, examples: 0, summary: 0 },
      activeContent: null,
      activeAction: null,
      modalOpen: false,
      showingAssistant: false,
    });

    loadAssistantModule(moduleId)
      .then((mod) => {
        const entry = mod.lessons[lessonId] ?? null;
        setState((prev) => ({ ...prev, entry, loading: false }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, entry: null, loading: false }));
      });
  }, [moduleId, lessonId]);

  const actionMap = useMemo((): Record<AssistantAction, string[] | undefined> => {
    if (!state.entry) return { explain: undefined, examples: undefined, summary: undefined };
    return {
      explain: state.entry.alternativeExplanations,
      examples: state.entry.examples,
      summary: state.entry.summaries,
    };
  }, [state.entry]);

  const openModal = useCallback(() => {
    setState((prev) => ({ ...prev, modalOpen: true }));
  }, []);

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, modalOpen: false }));
  }, []);

  const request = useCallback((action: AssistantAction) => {
    const items = actionMap[action];
    if (!items || items.length === 0) return;

    setState((prev) => {
      const index = prev.counters[action] % items.length;
      return {
        ...prev,
        activeContent: items[index],
        activeAction: action,
        modalOpen: false,
        showingAssistant: true,
        counters: { ...prev.counters, [action]: prev.counters[action] + 1 },
      };
    });
  }, [actionMap]);

  const showOriginal = useCallback(() => {
    setState((prev) => ({ ...prev, showingAssistant: false }));
  }, []);

  const showAssistantView = useCallback(() => {
    setState((prev) => prev.activeContent ? { ...prev, showingAssistant: true } : prev);
  }, []);

  const clearAssistant = useCallback(() => {
    setState((prev) => ({ ...prev, activeContent: null, activeAction: null, showingAssistant: false }));
  }, []);

  return {
    loading: state.loading,
    hasContent: state.entry !== null,
    modalOpen: state.modalOpen,
    showingAssistant: state.showingAssistant,
    activeContent: state.activeContent,
    activeAction: state.activeAction,
    openModal,
    closeModal,
    request,
    showOriginal,
    showAssistantView,
    clearAssistant,
  };
}
