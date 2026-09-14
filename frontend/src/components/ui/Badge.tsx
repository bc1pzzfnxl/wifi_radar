import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-tight transition-all';
  const variantStyles = {
    default: 'bg-zinc-100/80 backdrop-blur-md text-zinc-800 border border-zinc-200/80',
    neutral: 'bg-zinc-950 text-white border border-zinc-950 shadow-2xs',
    success: 'bg-emerald-500/10 backdrop-blur-md text-emerald-800 border border-emerald-500/20',
    warning: 'bg-amber-500/10 backdrop-blur-md text-amber-900 border border-amber-500/20',
    danger: 'bg-rose-500/10 backdrop-blur-md text-rose-800 border border-rose-500/20',
    outline: 'bg-white/80 backdrop-blur-md text-zinc-700 border border-zinc-200/90'
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
