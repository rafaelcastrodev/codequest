import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/progress.store';
import { useSettingsStore } from '@/store/settings.store';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { streak, lives } = useProgressStore();
  const { livesEnabled } = useSettingsStore();

  return (
    <header className="h-14 bg-bg-surface border-b border-bg-elevated flex items-center px-4 gap-3 flex-shrink-0 lg:hidden">
      <motion.button
        whileTap={{ scale: 0.9 }}
        aria-label="Menu"
        onClick={onMenuToggle}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8888AA] hover:text-[#E8E8F0] hover:bg-bg-elevated transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="3" y1="5" x2="17" y2="5" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="15" x2="17" y2="15" />
        </svg>
      </motion.button>

      <Link to="/" className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <span className="font-heading font-bold text-primary text-lg">CodeQuest</span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-sm">🔥</span>
          <span className="font-heading font-bold text-warning text-sm">{streak.current}</span>
        </div>
        {livesEnabled && (
          <div className="flex items-center gap-0.5">
            <span className="text-sm">❤️</span>
            <span className="font-heading font-bold text-accent text-sm">{lives.current}</span>
          </div>
        )}
      </div>
    </header>
  );
}
