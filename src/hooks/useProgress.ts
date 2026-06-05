import { useProgressStore, getLevelTitle, getLevelProgress } from '@/store/progress.store';

export function useProgress() {
  const store = useProgressStore();
  return {
    ...store,
    levelTitle: getLevelTitle(store.level),
    levelProgress: getLevelProgress(store.xp),
  };
}
