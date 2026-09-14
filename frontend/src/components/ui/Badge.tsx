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
  const baseStyles = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-normal transition-colors';
  const variantStyles = {
    default: 'bg-zinc-100 text-zinc-800 border border-zinc-200/80',
    neutral: 'bg-zinc-900 text-white border border-zinc-900',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/70',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200/70',
    outline: 'bg-white text-zinc-600 border border-zinc-200'
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
