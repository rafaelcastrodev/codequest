import { useEffect, useRef, useState, useCallback } from 'react';
import { useProgressStore, getLevelTitle } from '@/store/progress.store';
import { useSettingsStore } from '@/store/settings.store';
import { triggerConfetti } from '@/utils/confetti';
import { playSound } from '@/utils/sounds';

export interface LevelUpData {
  level: number;
  title: string;
}

export function useLevelUp() {
  const { level } = useProgressStore();
  const { soundEnabled } = useSettingsStore();
  const prevLevel = useRef(level);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);

  useEffect(() => {
    if (level > prevLevel.current) {
      setLevelUpData({ level, title: getLevelTitle(level) });
      triggerConfetti();
      if (soundEnabled) playSound('levelup');
    }
    prevLevel.current = level;
  }, [level, soundEnabled]);

  const dismiss = useCallback(() => setLevelUpData(null), []);

  return { levelUpData, dismiss };
}
