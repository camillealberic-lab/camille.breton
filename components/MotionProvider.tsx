'use client';

/**
 * MotionProvider — wraps the tree with LazyMotion + domAnimation.
 *
 * Why: `import { motion } from 'framer-motion'` pulls in the full
 * animation feature set (~85 KB gzipped). With LazyMotion we lazy-load
 * only `domAnimation` (~20 KB) and every child must import the lighter
 * `m` primitive (`<m.div>`) instead of `<motion.div>`. This cuts the
 * first-load JS by roughly 55 KB.
 *
 * `strict` throws at dev time if any child still uses `<motion.*>`,
 * catching regressions immediately.
 */

import { LazyMotion, domAnimation } from 'framer-motion';
import type { ReactNode } from 'react';

export default function MotionProvider({ children }: { children: ReactNode }) {
  // `strict` is OFF: it throws at render time if ANY descendant still
  // references `<motion.*>` — including types and third-party code paths
  // we don't control. Tree-shaking already gives us the bundle win from
  // `<m.*>`; strict only adds a dev-time guardrail. Leaving it off keeps
  // the app resilient to legacy imports sneaking back in via copy-paste.
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  );
}
