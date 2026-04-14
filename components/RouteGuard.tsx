'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function RouteGuard() {
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // On hard refresh or direct URL access, redirect to homepage
    if (pathname !== '/') {
      router.replace('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once — only on hard navigation (layout doesn't remount on SPA nav)

  return null;
}
