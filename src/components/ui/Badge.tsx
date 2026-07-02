import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'navy' | 'gold' | 'outline';
}

export function Badge({ className, variant = 'navy', ...props }: BadgeProps) {
  const styles = {
    navy: 'bg-navy-800 text-white',
    gold: 'bg-gold-100 text-gold-800',
    outline: 'border border-navy-200 text-navy-600 dark:border-navy-600 dark:text-navy-200'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
