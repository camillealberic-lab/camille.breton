'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { EASE_OUT } from '@/lib/easing';

export default function CustomCursor() {
  const [visible,   setVisible]   = useState(false);
  const [zooming,   setZooming]   = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const pathname = usePathname();

  // Reset cursor state on every route change
  useEffect(() => {
    setZooming(false);
    setScrolling(false);
  }, [pathname]);

  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);
  const x = useSpring(rawX, { stiffness: 600, damping: 40, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 600, damping: 40, mass: 0.5 });

  // Re-centre when zoom mode changes (scroll ring uses CSS margin instead)
  useEffect(() => {
    const half = zooming ? 22 : 9;
    rawX.set(mouse.current.x - half);
    rawY.set(mouse.current.y - half);
  }, [zooming, rawX, rawY]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      const half = zooming ? 22 : 9;
      rawX.set(e.clientX - half);
      rawY.set(e.clientY - half);
      if (!visible) setVisible(true);
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
  }, [rawX, rawY, visible, zooming]);

  return (
    <>
      {/* Default dot + zoom circle (mix-blend-difference) */}
      <motion.div
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
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] flex items-center justify-center"
        style={{ x, y, width: 120, height: 120, marginLeft: -51, marginTop: -51, border: '1.5px solid white', transformOrigin: 'center center' }}
        animate={{
          opacity: visible && scrolling ? 1 : 0,
          scale:   scrolling ? 1 : 0.1,
        }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <motion.span
          className="font-montserrat text-[8px] tracking-[0.32em] uppercase text-white select-none"
          animate={{ opacity: scrolling ? 1 : 0 }}
          transition={{ duration: 0.2, delay: scrolling ? 0.28 : 0 }}
        >
          scroll
        </motion.span>
      </motion.div>
    </>
  );
}
