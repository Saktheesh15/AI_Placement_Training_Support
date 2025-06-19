import { APP_NAME } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        &copy; {currentYear} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
