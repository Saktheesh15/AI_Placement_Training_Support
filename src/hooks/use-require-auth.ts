
"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
      // Preserve the current path to redirect back after login
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setAuthenticatedUser(user);
      setIsLoading(false);
    }
    // We don't set isLoading to false in the !user case because the redirect will happen.
    // The component using this hook should handle the loading state until redirect or auth is confirmed.
  }, [router, pathname]);

  return { isLoading, authenticatedUser };
}
