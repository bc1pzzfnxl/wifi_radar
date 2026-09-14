import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  elevated = false,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white/75 backdrop-blur-xl border border-white/90 rounded-3xl p-5 text-zinc-950 shadow-[0_4px_24px_rgba(0,0,0,0.03)] ring-1 ring-zinc-900/5 transition-all',
          elevated && 'shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-zinc-900/10',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
