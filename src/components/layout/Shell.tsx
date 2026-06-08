import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AnimatedOutlet } from './AnimatedOutlet';
import { ToastContainer } from '@/components/feedback/ToastContainer';
import { FeedbackFab } from '@/components/feedback/FeedbackFab';
import { OnboardingOverlay } from '@/components/onboarding';
import { useLevelUp } from '@/hooks/useLevelUp';
import { useFontScale } from '@/hooks/useFontScale';

function LevelUpWatcher() {
  useLevelUp();
  return null;
}

function FontScaleWatcher() {
  useFontScale();
  return null;
}

export function Shell() {
  const { pathname } = useLocation();
  const isExercisePage = /^\/exercise\//.test(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (isExercisePage) setSidebarOpen(false);
  }, [isExercisePage]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <LevelUpWatcher />
      <FontScaleWatcher />

      {/* Desktop sidebar — toggled via menu button, auto-hidden on exercise */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={closeSidebar}
            />
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed inset-y-0 left-0 z-40 lg:hidden"
            >
              <Sidebar onNavigate={closeSidebar} />
            </motion.div>
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="hidden lg:flex flex-shrink-0 z-40"
            >
              <Sidebar onNavigate={closeSidebar} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
          <AnimatedOutlet />
        </main>
      </div>

      <ToastContainer />
      <FeedbackFab />
      <OnboardingOverlay />
    </div>
  );
}
