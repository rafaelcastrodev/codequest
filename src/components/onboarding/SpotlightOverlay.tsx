import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotlightOverlayProps {
  targetSelector: string;
  padding?: number;
  borderRadius?: number;
  children: ReactNode;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getTooltipStyle(rect: Rect, position: string, padding: number): React.CSSProperties {
  const gap = 16;
  const r = {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  switch (position) {
    case 'top':
      return { bottom: `${window.innerHeight - r.y + gap}px`, left: `${r.x}px`, maxWidth: `${Math.min(r.width + 80, 360)}px` };
    case 'left':
      return { top: `${r.y}px`, right: `${window.innerWidth - r.x + gap}px`, maxWidth: '320px' };
    case 'right':
      return { top: `${r.y}px`, left: `${r.x + r.width + gap}px`, maxWidth: '320px' };
    case 'bottom':
    default:
      return { top: `${r.y + r.height + gap}px`, left: `${r.x}px`, maxWidth: `${Math.min(r.width + 80, 360)}px` };
  }
}

export function SpotlightOverlay({
  targetSelector,
  padding = 8,
  borderRadius = 16,
  children,
  tooltipPosition = 'bottom',
}: SpotlightOverlayProps) {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTargetRect({ x: r.x, y: r.y, width: r.width, height: r.height });
  }, [targetSelector]);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [measure]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!targetRect) return null;

  const cutout = {
    x: targetRect.x - padding,
    y: targetRect.y - padding,
    w: targetRect.width + padding * 2,
    h: targetRect.height + padding * 2,
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="spotlight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[60]"
      >
        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={cutout.x}
                y={cutout.y}
                width={cutout.w}
                height={cutout.h}
                rx={borderRadius}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0" y="0" width="100%" height="100%"
            fill="black" opacity="0.75"
            mask="url(#spotlight-mask)"
          />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute z-[61]"
          style={getTooltipStyle(targetRect, tooltipPosition, padding)}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
