import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AnimatedOutlet } from './AnimatedOutlet';
import { ToastContainer } from '@/components/feedback/ToastContainer';
import { LevelUpOverlay } from '@/components/feedback/LevelUpOverlay';
import { OnboardingOverlay } from '@/components/onboarding';
import { useLevelUp } from '@/hooks/useLevelUp';
import { useFontScale } from '@/hooks/useFontScale';

function LevelUpWatcher() {
  const { levelUpData, dismiss } = useLevelUp();
  if (!levelUpData) return null;
  return <LevelUpOverlay level={levelUpData.level} title={levelUpData.title} onDismiss={dismiss} />;
}

function FontScaleWatcher() {
  useFontScale();
  return null;
}

function useIsLg() {
  const [isLg, setIsLg] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isLg;
}

export function Shell() {
  const { pathname } = useLocation();
  const isExercisePage = /^\/exercise\//.test(pathname);
  const isLg = useIsLg();
  const initializedRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches && !/^\/exercise\//.test(window.location.pathname));
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (isExercisePage) setSidebarOpen(false);
  }, [isExercisePage]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    if (!isLg) setSidebarOpen(false);
  }, [isLg]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <LevelUpWatcher />
      <FontScaleWatcher />

      {/* Mobile/tablet sidebar — overlay */}
      <AnimatePresence>
        {sidebarOpen && !isLg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/60 z-30"
              onClick={closeSidebar}
            />
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed inset-y-0 left-0 z-40"
            >
              <Sidebar onNavigate={closeSidebar} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar — inline, no animation */}
      {sidebarOpen && isLg && (
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
          <AnimatedOutlet />
        </main>
      </div>

      <ToastContainer />
      <OnboardingOverlay />
    </div>
  );
}
