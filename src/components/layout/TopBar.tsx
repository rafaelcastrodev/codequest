import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageInfoButton } from '@/components/layout/PageInfoButton';
import { FontSizeButton } from '@/components/layout/FontSizeButton';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { icons } from '@/components/ui/Icon';
import { useProgressStore } from '@/store/progress.store';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { pathname } = useLocation();
  const streak = useProgressStore((s) => s.streak);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <header className="h-14 bg-bg-surface border-b border-bg-elevated flex items-center px-4 gap-3 flex-shrink-0">
      <motion.button
        whileTap={{ scale: 0.9 }}
        aria-label="Menu"
        onClick={onMenuToggle}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-text-main hover:bg-bg-elevated transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="3" y1="5" x2="17" y2="5" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="15" x2="17" y2="15" />
        </svg>
      </motion.button>

      <Link to="/" className="flex items-center gap-2">
        <icons.bolt className="text-lg" />
        <span className="font-heading font-bold text-primary text-lg">CodeQuest</span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setFeedbackOpen(true)}
          aria-label="Enviar feedback"
          title="Feedback"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary text-white
            shadow-[0_0_10px_rgba(124,92,252,0.4)] hover:shadow-[0_0_16px_rgba(124,92,252,0.6)]
            transition-shadow duration-200"
        >
          <icons.speech size={18} aria-hidden={true} />
        </motion.button>
        <FontSizeButton />
        {pathname === '/' ? (
          <div className="flex items-center gap-1.5">
            <icons.fire className="text-2xl" />
            <span className="font-heading font-bold text-warning text-lg">{streak.current}</span>
          </div>
        ) : (
          <PageInfoButton />
        )}
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </header>
  );
}
