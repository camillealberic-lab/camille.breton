'use client';

/**
 * CustomCursor — a lightweight, state-aware cursor that replaces the
 * native pointer on desktop (hover-capable, fine-pointer devices only —
 * see globals.css for the media-query gating).
 *
 * ── Why this refactor ───────────────────────────────────────────────
 * The previous version registered 5 window listeners inside a single
 * effect whose dependency array contained `[rawX, rawY, visible, zooming]`.
 * That meant every time the cursor entered a zoom target or toggled
 * visibility, React ripped down and re-attached every listener — an
 * allocation-heavy churn on a mousemove-driven UI.
 *
 * Fix: register each listener exactly once via an empty-dep effect and
 * read the "latest" values of `visible`/`zooming` through refs, which
 * the previous render keeps in sync via a separate cheap effect.
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { m, useMotionValue, useSpring } from 'framer-motion';
import { EASE_OUT } from '@/lib/easing';

const DOT_HALF  = 9;   // half-size of the default dot (18 px)
const ZOOM_HALF = 22;  // half-size of the expanded zoom disc (44 px)

export default function CustomCursor() {
  const [visible,   setVisible]   = useState(false);
  const [zooming,   setZooming]   = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const mouse    = useRef({ x: 0, y: 0 });
  const pathname = usePathname();

  // Reset transient cursor modes on every route change — otherwise a
  // hover state can survive into the next page and "stick".
  useEffect(() => {
    setZooming(false);
    setScrolling(false);
  }, [pathname]);

  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);
  const x    = useSpring(rawX, { stiffness: 600, damping: 40, mass: 0.5 });
  const y    = useSpring(rawY, { stiffness: 600, damping: 40, mass: 0.5 });

  // ── Latest-value refs — read by the mousemove handler without
  //    forcing the main effect to re-run every state change.
  const zoomingRef = useRef(zooming);
  const visibleRef = useRef(visible);
  useEffect(() => { zoomingRef.current = zooming; }, [zooming]);
  useEffect(() => { visibleRef.current = visible; }, [visible]);

  // Re-centre the spring target when toggling zoom (different half-size).
  useEffect(() => {
    const half = zooming ? ZOOM_HALF : DOT_HALF;
    rawX.set(mouse.current.x - half);
    rawY.set(mouse.current.y - half);
  }, [zooming, rawX, rawY]);

  // ── Single mount-only listener registration ──
  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      const half = zoomingRef.current ? ZOOM_HALF : DOT_HALF;
      rawX.set(e.clientX - half);
      rawY.set(e.clientY - half);
      if (!visibleRef.current) setVisible(true);
    };
    const hide = () => setVisible(false);
    const show = () => setVisible(true);

    const onEnter = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t?.closest('[data-cursor-zoom]'))    setZooming(true);
      if (t?.closest('[data-cursor-scroll]'))  setScrolling(true);
      if (t?.closest('[data-cursor-archive]')) setArchiving(true);
    };
    const onLeave = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t?.closest('[data-cursor-zoom]'))    setZooming(false);
      if (t?.closest('[data-cursor-scroll]'))  setScrolling(false);
      if (t?.closest('[data-cursor-archive]')) setArchiving(false);
    };

    window.addEventListener('mousemove',  move);
    window.addEventListener('mouseleave', hide);
    window.addEventListener('mouseenter', show);
    window.addEventListener('mouseover',  onEnter);
    window.addEventListener('mouseout',   onLeave);
    return () => {
      window.removeEventListener('mousemove',  move);
      window.removeEventListener('mouseleave', hide);
      window.removeEventListener('mouseenter', show);
      window.removeEventListener('mouseover',  onEnter);
      window.removeEventListener('mouseout',   onLeave);
    };
  }, [rawX, rawY]);

  return (
    <div className="hidden md:contents">
      {/* Default dot + zoom circle (mix-blend-difference) */}
      <m.div
        className="fixed top-0 left-0 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference"
        style={{ x, y }}
        animate={{
          opacity: visible && !scrolling && !archiving ? 1 : 0,
          width:  zooming ? 44 : 18,
          height: zooming ? 44 : 18,
        }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
      />

      {/* Scroll ring — grows from the dot's center (margin offsets center it on same spring) */}
      <m.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] flex items-center justify-center"
        style={{ x, y, width: 120, height: 120, marginLeft: -51, marginTop: -51, border: '1.5px solid white', transformOrigin: 'center center' }}
        animate={{
          opacity: visible && scrolling ? 1 : 0,
          scale:   scrolling ? 1 : 0.1,
        }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <m.span
          className="font-montserrat text-[8px] tracking-[0.32em] uppercase text-white select-none"
          animate={{ opacity: scrolling ? 1 : 0 }}
          transition={{ duration: 0.2, delay: scrolling ? 0.28 : 0 }}
        >
          scroll
        </m.span>
      </m.div>
    </div>
  );
}
