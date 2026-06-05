import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cloneElement } from 'react';

export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-0"
      >
        {outlet && cloneElement(outlet)}
      </motion.div>
    </AnimatePresence>
  );
}
