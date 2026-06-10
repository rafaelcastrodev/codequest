import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  label?: string;
}

const variantClasses = {
  primary: 'bg-primary shadow-[0_0_8px_rgba(0,212,170,0.5)]',
  secondary: 'bg-secondary shadow-[0_0_8px_rgba(124,92,252,0.5)]',
  accent: 'bg-accent shadow-[0_0_8px_rgba(255,107,107,0.5)]',
  warning: 'bg-warning shadow-[0_0_8px_rgba(255,184,77,0.5)]',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  className = '',
  label,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-text-muted font-body">{label}</span>}
          {showLabel && (
            <span className="text-xs text-text-muted font-body ml-auto">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-bg-elevated rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full rounded-full ${variantClasses[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
