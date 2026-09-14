import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-mono rounded cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';
  
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    secondary: 'bg-zinc-900/80 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-800 hover:border-zinc-500 hover:text-white',
    danger: 'bg-rose-950/40 text-rose-300 border border-rose-600/50 hover:bg-rose-900/60 hover:border-rose-500 hover:shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    ghost: 'bg-transparent text-emerald-400/80 hover:bg-emerald-950/40 hover:text-emerald-300'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
