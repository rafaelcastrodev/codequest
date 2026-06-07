import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageInfoButton } from '@/components/layout/PageInfoButton';
import { FontSizeButton } from '@/components/layout/FontSizeButton';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { useProgressStore } from '@/store/progress.store';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { pathname } = useLocation();
  const streak = useProgressStore((s) => s.streak);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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
        <FontSizeButton />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setFeedbackOpen(true)}
          aria-label="Enviar feedback"
          title="Feedback"
          className="w-7 h-7 flex items-center justify-center rounded-full border border-[#8888AA]/30 text-[#8888AA] hover:border-secondary/50 hover:text-secondary hover:bg-secondary/10 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </motion.button>
        {pathname === '/' ? (
          <div className="flex items-center gap-1">
            <span className="text-sm">🔥</span>
            <span className="font-heading font-bold text-warning text-sm">{streak.current}</span>
          </div>
        ) : (
          <PageInfoButton />
        )}
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </header>
  );
}
