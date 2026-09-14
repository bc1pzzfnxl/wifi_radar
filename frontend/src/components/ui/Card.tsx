import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  glow = false,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-zinc-950/80 backdrop-blur-md border border-emerald-900/40 rounded-lg p-4 font-mono',
          glow && 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
