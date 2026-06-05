import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/store/toast.store';

const VARIANT_STYLES = {
  achievement: 'border-secondary/50 bg-secondary/15 shadow-[0_0_20px_rgba(124,92,252,0.25)]',
  levelup: 'border-primary/50 bg-primary/15 shadow-[0_0_20px_rgba(0,212,170,0.25)]',
  streak: 'border-warning/50 bg-warning/15 shadow-[0_0_20px_rgba(255,184,77,0.25)]',
} as const;

const TITLE_COLOR = {
  achievement: 'text-secondary',
  levelup: 'text-primary',
  streak: 'text-warning',
} as const;

const AUTO_DISMISS_MS = 4000;

interface ToastItemProps {
  id: string;
  variant: keyof typeof VARIANT_STYLES;
  icon: string;
  title: string;
  message: string;
  onDismiss: (id: string) => void;
}

function ToastItem({ id, variant, icon, title, message, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      onClick={() => onDismiss(id)}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer
        bg-bg-surface backdrop-blur-sm min-w-[220px] max-w-[300px]
        ${VARIANT_STYLES[variant]}
      `}
    >
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className={`font-heading font-bold text-sm ${TITLE_COLOR[variant]}`}>{title}</p>
        <p className="font-body text-xs text-[#E8E8F0] truncate">{message}</p>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const { queue, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {queue.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem
              id={toast.id}
              variant={toast.variant}
              icon={toast.icon}
              title={toast.title}
              message={toast.message}
              onDismiss={dismiss}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
