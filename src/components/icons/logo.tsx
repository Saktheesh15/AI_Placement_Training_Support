import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function ElevixLogoText({ className, short = false }: { className?: string, short?: boolean }) {
  return (
    <span className={cn("font-semibold text-primary", className)}>
      {short ? "E" : APP_NAME.split(" ")[0]} {/* Display "Elévix" or "E" */}
    </span>
  );
}
