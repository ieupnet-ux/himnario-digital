import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-11 rounded-xl border border-navy-200 bg-white px-4 text-sm text-navy-900 placeholder:text-navy-400 outline-none transition-colors',
          'focus:border-gold-500 focus:ring-2 focus:ring-gold-200',
          'dark:bg-navy-800 dark:border-navy-600 dark:text-cream dark:placeholder:text-navy-400',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
