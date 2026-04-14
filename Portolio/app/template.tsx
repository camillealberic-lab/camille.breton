'use client';

/**
 * Next.js App Router template — re-mounts on every navigation.
 * When coming from a nav click (flagFromNav was called before router.push),
 * the whole page content rises from below (y: 100vh → 0).
 *
 * CSS quirk: because framer-motion applies a CSS transform on this div,
 * any descendant with `position: fixed` is positioned relative to THIS div
 * (not the viewport).  This means the pages' `fixed inset-0` containers
 * all slide with the template animation for free — no per-page changes needed.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { EASE_EXPO } from '@/lib/easing';

// First render ever = true (initial page load → fade in, no slide)
// Every subsequent navigation = false (slide from below)
let _firstLoad = true;

export default function Template({ children }: { children: React.ReactNode }) {
  const [isFirstLoad] = useState<boolean>(() => {
    const v = _firstLoad;
    _firstLoad = false;
    return v;
  });
  const pathname = usePathname();

  // Project pages scroll natively — don't wrap in a fixed container.
  if (pathname.startsWith('/work/')) {
    return <>{children}</>;
  }

  return (
    <motion.div
      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
      initial={{ y: isFirstLoad ? 0 : '100vh', opacity: isFirstLoad ? 0 : 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: isFirstLoad ? 0.4 : 1.2,
        ease: EASE_EXPO,
      }}
    >
      {children}
    </motion.div>
  );
}
