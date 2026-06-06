import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AnimatedOutlet } from './AnimatedOutlet';
import { ToastContainer } from '@/components/feedback/ToastContainer';
import { OnboardingOverlay } from '@/components/onboarding';
import { useLevelUp } from '@/hooks/useLevelUp';
import { useProgressStore } from '@/store/progress.store';

function LevelUpWatcher() {
  useLevelUp();
  return null;
}

const REGEN_CHECK_MS = 60_000;

function LivesRegenWatcher() {
  const regenLives = useProgressStore((s) => s.regenLives);

  useEffect(() => {
    regenLives();
    const id = setInterval(regenLives, REGEN_CHECK_MS);
    return () => clearInterval(id);
  }, [regenLives]);

  return null;
}

export function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <LevelUpWatcher />
      <LivesRegenWatcher />

      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Tablet sidebar — overlay when toggled */}
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
      <OnboardingOverlay />
    </div>
  );
}
