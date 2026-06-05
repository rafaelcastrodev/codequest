import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-bg-surface border border-bg-elevated rounded-2xl shadow-2xl p-6 ${className}`}
          >
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-semibold text-[#E8E8F0]">{title}</h2>
                <button
                  aria-label="Fechar"
                  onClick={onClose}
                  className="text-[#8888AA] hover:text-[#E8E8F0] transition-colors text-xl leading-none"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
