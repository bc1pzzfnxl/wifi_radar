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
          'bg-white border border-zinc-200/80 rounded-xl p-4 text-zinc-900 transition-all',
          elevated ? 'shadow-md border-zinc-300' : 'shadow-xs',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
