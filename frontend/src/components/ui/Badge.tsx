import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono tracking-wider transition-colors';
  const variantStyles = {
    default: 'bg-emerald-950 text-emerald-400 border border-emerald-800/60',
    success: 'bg-green-950/80 text-green-400 border border-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.3)]',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse',
    outline: 'bg-transparent text-emerald-500 border border-emerald-800'
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variantStyles[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
};
