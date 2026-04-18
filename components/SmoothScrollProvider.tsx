'use client';

import { useEffect, useLayoutEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type LenisInstance = {
  raf:           (time: number) => void;
  destroy:       () => void;
  scrollTo:      (target: number, opts?: Record<string, unknown>) => void;
  stop:          () => void;
  start:         () => void;
  on:            (event: string, handler: (...args: unknown[]) => void) => void;
  off:           (event: string, handler: (...args: unknown[]) => void) => void;
  isStopped:     boolean;
  // Internal state exposed as public properties in Lenis v2:
  targetScroll:  number;
  animatedScroll: number;
};

const getGlobalLenis = () =>
  typeof window !== 'undefined'
    ? (window as unknown as { __lenis?: LenisInstance }).__lenis
    : undefined;

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  /* ── Canonical scroll reset + gesture gate ─────────────────────────────
     On every route change we: (1) snap the native viewport to 0, (2) snap
     Lenis's internal state to 0 (force bypasses the isStopped guard),
     (3) stop Lenis, and (4) install capture-phase swallowers for wheel /
     touchmove / keyboard-scroll events so NOTHING can drive scroll during
     the settle window.

     Why swallow at capture: Lenis's onVirtualScroll updates targetScroll
     before its isStopped guard. Previously, residual trackpad inertia kept
     pushing targetScroll past the stop window — when lenis.start() fired,
     it lerped straight to the bottom of the new page. Blocking at capture
     stops those events before they ever reach Lenis.
  ────────────────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);

    const lenis = getGlobalLenis();

    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.stop();
    }

    // Disable Lenis's animation engine during the settle window by replacing
    // its public raf() with a no-op.  This means even if residual wheel events
    // push targetScroll to a non-zero value (Lenis's onVirtualScroll runs
    // before our capture listener since window-target events fire in listener
    // registration order), the animate loop can never call setScroll →
    // window.scrollTo and can never move the page.  Our own forceZero writes
    // directly to the DOM and to the public targetScroll / animatedScroll
    // properties, bypassing the blocked animation path.
    const origRaf = lenis?.raf.bind(lenis) ?? null;
    if (lenis) lenis.raf = () => { /* no-op during settle */ };

    // Capture-phase swallower — belt-and-suspenders for touch + keyboard,
    // and updates lastGestureMs for the quiescence timer.
    let lastGestureMs = performance.now();
    const swallow = (e: Event) => {
      lastGestureMs = performance.now();
      e.stopImmediatePropagation();
      e.preventDefault?.();
    };
    const events: [string, AddEventListenerOptions][] = [
      ['wheel',     { capture: true, passive: false }],
      ['touchmove', { capture: true, passive: false }],
      ['touchstart',{ capture: true, passive: false }],
      ['keydown',   { capture: true, passive: false }],
    ];
    events.forEach(([type, opts]) => window.addEventListener(type, swallow, opts));

    const MIN_STOP_MS = 500;
    const QUIET_MS    = 260;
    const startMs     = performance.now();
    let killed        = false;
    let rafId         = 0;

    const forceZero = () => {
      // Zero out Lenis's internal scroll pointers every frame so that even if
      // wheel events pushed targetScroll, the values are clamped back to 0
      // before Lenis's own RAF has a chance to animate them.
      if (lenis) {
        lenis.targetScroll   = 0;
        lenis.animatedScroll = 0;
      }
      if (window.scrollY !== 0) {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
      }
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    };

    const tick = () => {
      if (killed) return;
      const now        = performance.now();
      const sinceStart = now - startMs;
      const sinceQuiet = now - lastGestureMs;

      if (sinceStart >= MIN_STOP_MS && sinceQuiet >= QUIET_MS) {
        forceZero();
        events.forEach(([type, opts]) => window.removeEventListener(type, swallow, opts));
        // Restore Lenis's raf BEFORE start() so the animation loop is live
        // when start() calls reset() and hands control back to the user.
        if (lenis && origRaf) lenis.raf = origRaf;
        if (lenis) lenis.start();
        // start() → internalStart() → reset() only reassigns the three public
        // scroll properties; it does NOT touch the animate object's internal
        // spring/lerp state (fromValue, toValue, currentTime).  If trackpad
        // inertia had pushed targetScroll to maxScroll, the animate object
        // still holds that stale spring state and will lerp toward it on the
        // very first raf() call.  Calling scrollTo(0, immediate, force) here
        // invokes animate.reset(0) which fully zeroes the spring — this is
        // the ONLY code path that touches animate's internal state.
        if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
        return;
      }
      forceZero();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      killed = true;
      if (rafId) cancelAnimationFrame(rafId);
      events.forEach(([type, opts]) => window.removeEventListener(type, swallow, opts));
      // Always restore raf before cleanup so the next effect (or page) gets
      // a fully functional Lenis instance.
      if (lenis && origRaf) lenis.raf = origRaf;
      if (lenis?.isStopped) lenis.start();
    };
  }, [pathname]);

  /* ── Lenis init (runs once, persists for the app lifetime) ──────────── */
  useEffect(() => {
    let lenis: LenisInstance | null = null;
    let rafId: number;

    import('lenis').then(({ default: Lenis }) => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      // `smoothTouch` was removed in Lenis v2 — touch is now handled via
       // `syncTouch` (off by default). Keeping it off preserves native,
       // inertia-driven touch scroll on mobile, which feels more familiar
       // than a smoothed one.
      lenis = new Lenis({
        lerp:            isMobile ? 0.055 : 0.08,
        smoothWheel:     true,
        touchMultiplier: isMobile ? 1.4 : 2,
      }) as unknown as LenisInstance;
      (window as unknown as Record<string, unknown>).__lenis = lenis;

      function raf(time: number) {
        lenis!.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
      delete (window as unknown as Record<string, unknown>).__lenis;
    };
  }, []);

  return <>{children}</>;
}
