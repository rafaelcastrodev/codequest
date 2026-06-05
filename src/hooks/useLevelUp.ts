import { useEffect, useRef } from 'react';
import { useProgressStore, getLevelTitle } from '@/store/progress.store';
import { useToastStore } from '@/store/toast.store';
import { useSettingsStore } from '@/store/settings.store';
import { playSound } from '@/utils/sounds';

export function useLevelUp() {
  const { level } = useProgressStore();
  const { pushLevelUp } = useToastStore();
  const { soundEnabled } = useSettingsStore();
  const prevLevel = useRef(level);

  useEffect(() => {
    if (level > prevLevel.current) {
      pushLevelUp(level, getLevelTitle(level));
      if (soundEnabled) playSound('levelup');
    }
    prevLevel.current = level;
  }, [level, pushLevelUp, soundEnabled]);
}
