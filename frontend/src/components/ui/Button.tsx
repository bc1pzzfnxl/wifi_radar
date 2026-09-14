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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] text-xs';
  
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2'
  };

  const variantStyles = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-2xs border border-zinc-900',
    secondary: 'bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 shadow-2xs',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs',
    ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
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
