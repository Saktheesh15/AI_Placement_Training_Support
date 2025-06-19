import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Container({ children, className, as: Comp = 'div' }: ContainerProps) {
  return (
    <Comp className={cn('container mx-auto px-4 py-8 sm:px-6 lg:px-8', className)}>
      {children}
    </Comp>
  );
}
