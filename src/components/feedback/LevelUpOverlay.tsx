import { motion, AnimatePresence } from 'framer-motion';
import { getLevelTitle } from '@/store/progress.store';
import { Button } from '@/components/ui/Button';
import { icons } from '@/components/ui/Icon';

interface LevelUpOverlayProps {
  level: number;
  title: string;
  onDismiss: () => void;
}

export function LevelUpOverlay({ level, title, onDismiss }: LevelUpOverlayProps) {
  const prevTitle = getLevelTitle(level - 1);
  const isNewTitle = prevTitle !== title;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-bg-surface border border-secondary/40 rounded-2xl p-8 text-center max-w-sm w-full shadow-[0_0_60px_rgba(124,92,252,0.3)]"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 15 }}
            className="text-6xl mb-4"
          >
            <icons.levelUp />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <p className="font-body text-sm text-text-muted mb-1">Você alcançou o</p>
            <h2 className="font-heading font-bold text-3xl text-secondary mb-1">
              Nível {level}
            </h2>
            {isNewTitle && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                className="font-heading font-bold text-lg text-primary"
              >
                {title}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Button variant="secondary" size="md" className="w-full" onClick={onDismiss}>
              Continuar
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
