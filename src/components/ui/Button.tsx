import { motion } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'warning' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-bg-primary font-bold hover:bg-primary-dark shadow-[0_0_12px_rgba(0,212,170,0.3)] hover:shadow-[0_0_20px_rgba(0,212,170,0.5)]',
  secondary:
    'bg-secondary text-white font-bold hover:bg-secondary-dark shadow-[0_0_12px_rgba(124,92,252,0.3)] hover:shadow-[0_0_20px_rgba(124,92,252,0.5)]',
  accent:
    'bg-accent text-white font-bold hover:bg-accent-dark shadow-[0_0_12px_rgba(255,107,107,0.3)]',
  warning:
    'bg-warning/20 text-warning border border-warning/40 hover:bg-warning/30 font-semibold',
  ghost:
    'bg-transparent text-[#E8E8F0] border border-[#252542] hover:bg-[#252542] hover:border-[#7C5CFC]',
  danger:
    'bg-transparent text-accent border border-accent hover:bg-accent hover:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled ?? loading}
      className={`
        inline-flex items-center justify-center gap-2 font-body transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      {...(props as object)}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
