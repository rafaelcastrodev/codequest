import { useEffect, useRef, useCallback } from 'react';
import { loadAchievements, loadCurriculum, loadAllModules } from '@/content/loader';
import { findNewlyUnlocked } from '@/engine/achievement-engine';
import { useProgressStore } from '@/store/progress.store';
import { useToastStore } from '@/store/toast.store';
import { useSettingsStore } from '@/store/settings.store';
import { triggerBadgeConfetti } from '@/utils/confetti';
import { playSound } from '@/utils/sounds';
import type { Achievement, Module } from '@/content/curriculum.types';

interface AchievementsData {
  achievements: Achievement[];
  modules: Map<string, Module>;
}

let sharedData: AchievementsData | null = null;
let loadPromise: Promise<AchievementsData> | null = null;

async function loadData(): Promise<AchievementsData> {
  if (sharedData) return sharedData;
  if (!loadPromise) {
    loadPromise = (async () => {
      const [achievementsFile, curriculum] = await Promise.all([
        loadAchievements(),
        loadCurriculum(),
      ]);
      const modules = await loadAllModules(curriculum);
      sharedData = { achievements: achievementsFile.achievements, modules };
      return sharedData;
    })();
  }
  return loadPromise;
}

export function useAchievements() {
  const dataRef = useRef<AchievementsData | null>(null);
  const { unlockAchievement, achievements, xp, streak, completedExercises } = useProgressStore();
  const { pushAchievement } = useToastStore();
  const { soundEnabled } = useSettingsStore();

  useEffect(() => {
    loadData().then((d) => {
      dataRef.current = d;
    });
  }, []);

  const checkAndUnlock = useCallback(() => {
    const data = dataRef.current;
    if (!data) return;

    const snapshot = { xp, streak, completedExercises, achievements };
    const newlyUnlocked = findNewlyUnlocked(data.achievements, snapshot, data.modules);

    for (const achievement of newlyUnlocked) {
      unlockAchievement(achievement.id);
      pushAchievement(achievement);
      triggerBadgeConfetti();
      if (soundEnabled) playSound('badge');
    }
  }, [xp, streak, completedExercises, achievements, unlockAchievement, pushAchievement, soundEnabled]);

  return { checkAndUnlock };
}
