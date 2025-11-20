'use client';

/**
 * Scroll Area Component
 * Simple wrapper for scrollable content areas
 */

import { cn } from '@/lib/utils';

interface ScrollAreaProps {
  className?: string;
  children: React.ReactNode;
}

export function ScrollArea({ className, children }: ScrollAreaProps) {
  return (
    <div className={cn('overflow-auto', className)}>
      {children}
    </div>
  );
}

