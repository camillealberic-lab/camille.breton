'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { EASE_OUT } from '@/lib/easing';

/* ── Archive images ─── */
const ARCHIVE_IMGS = [
  '/projects/archive/corvus.webp',
  '/projects/archive/deus.webp',
  '/projects/archive/photo.webp',
  '/projects/archive/screen.webp',
  '/projects/archive/immeubles.webp',
];

const IMG_W    = 420;
const IMG_H    = 262;
const MIN_DIST = 90;
const DRIFT    = 22;

interface TrailItem {
  id:  number;
  x:   number;
  y:   number;
  src: string;
  vx:  number;
  vy:  number;
}

interface ArchivePanelProps {
  visible: boolean;
}

export default function ArchivePanel({ visible }: ArchivePanelProps) {
  const [mounted,   setMounted]   = useState(false);
  const [trail,     setTrail]     = useState<TrailItem[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [isMobile,  setIsMobile]  = useState(false);

  const mouseRef = useRef({ x: -999, y: -999 });
  const lastPos  = useRef({ x: -9999, y: -9999 });
  const prevPos  = useRef({ x: -9999, y: -9999 });
  const counter  = useRef(0);
  const imgIdx   = useRef(0);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
  }, []);

  /* ── Track mouse at all times (desktop cursor) ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ── Snap cursor position when panel opens ── */
  useEffect(() => {
    if (visible) setCursorPos({ x: mouseRef.current.x, y: mouseRef.current.y });
  }, [visible]);

  /* ── Shared spawn ── */
  const spawn = useCallback((x: number, y: number, vx: number, vy: number) => {
    const id  = ++counter.current;
    const src = ARCHIVE_IMGS[imgIdx.current % ARCHIVE_IMGS.length];
    imgIdx.current++;
    const cx = Math.max(IMG_W / 2, Math.min(x, window.innerWidth  - IMG_W / 2));
    const cy = Math.max(IMG_H / 2, Math.min(y, window.innerHeight - IMG_H / 2));
    setTrail(prev => [...prev.slice(-5), { id, x: cx, y: cy, src, vx, vy }]);
    setTimeout(() => setTrail(prev => prev.filter(t => t.id !== id)), 1400);
  }, []);

  /* ── Desktop: mousemove trail ── */
  const onMouseMove = useCallback((e: MouseEvent) => {
    const dx   = e.clientX - lastPos.current.x;
    const dy   = e.clientY - lastPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const rawDx   = e.clientX - prevPos.current.x;
    const rawDy   = e.clientY - prevPos.current.y;
    const rawDist = Math.sqrt(rawDx * rawDx + rawDy * rawDy) || 1;
    const vx      = rawDx / rawDist;
    const vy      = rawDy / rawDist;
    prevPos.current = { x: e.clientX, y: e.clientY };

    if (dist < MIN_DIST) return;
    lastPos.current = { x: e.clientX, y: e.clientY };
    spawn(e.clientX, e.clientY, vx, vy);
  }, [spawn]);

  /* ── Mobile: tap to spawn ── */
  const onTouch = useCallback((e: TouchEvent) => {
    const t = e.changedTouches[0];
    const angle = (Math.random() - 0.5) * Math.PI * 1.6;
    const vx = Math.sin(angle);
    const vy = -Math.abs(Math.cos(angle)) * 0.5;
    spawn(t.clientX, t.clientY, vx, vy);
  }, [spawn]);

  /* ── Bind correct handler ── */
  useEffect(() => {
    if (!visible) { setTrail([]); return; }
    if (isMobile) {
      window.addEventListener('touchend', onTouch);
      return () => window.removeEventListener('touchend', onTouch);
    } else {
      window.addEventListener('mousemove', onMouseMove);
      return () => window.removeEventListener('mousemove', onMouseMove);
    }
  }, [visible, isMobile, onMouseMove, onTouch]);

  if (!mounted) return null;

  const panelY = visible ? '0%' : '100%';

  return createPortal(
    <m.div
      data-cursor-archive
      className="fixed inset-0 z-[60] overflow-hidden select-none"
      style={{ backgroundColor: 'var(--green)', cursor: 'none' }}
      initial={{ y: '100%' }}
      animate={{ y: panelY }}
      transition={{ duration: 0.75, ease: EASE_OUT }}
    >
      {/* Trail images */}
      <AnimatePresence>
        {trail.map(item => (
          <TrailImage key={item.id} item={item} isMobile={isMobile} />
        ))}
      </AnimatePresence>

      {/* "Archive" centré */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <m.h1
          className="font-geologica font-bold text-cream select-none"
          style={{ fontSize: 'clamp(64px, 11vw, 172px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
          transition={{ duration: 0.55, delay: visible ? 0.25 : 0, ease: EASE_OUT }}
        >
          Archive
        </m.h1>
      </div>

      {/* Desktop cursor text */}
      <div
        className="hidden md:block pointer-events-none fixed z-[9999]"
        style={{ left: cursorPos.x, top: cursorPos.y, transform: 'translate(-50%, -50%)' }}
      >
        <p className="font-montserrat text-[8px] tracking-[0.45em] uppercase text-white whitespace-nowrap">
          Move cursor
        </p>
      </div>

      {/* Mobile hint */}
      <m.p
        className="md:hidden absolute bottom-10 left-0 right-0 text-center font-montserrat text-[7px] tracking-[0.45em] uppercase text-white/40 pointer-events-none"
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Tap to explore
      </m.p>
    </m.div>,
    document.body
  );
}

/* ── Single trail image ─────────────────────────────── */
function TrailImage({ item, isMobile }: { item: TrailItem; isMobile: boolean }) {
  const isSmall = item.src.includes('corvus') || item.src.includes('deus');
  const maxW = isMobile
    ? (isSmall ? 180 : 300)
    : (isSmall ? 260 : 420);

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: item.x, top: item.y }}
    >
      <m.div
        style={{ x: 0, y: 0 }}
        initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
        animate={{ scale: 1, opacity: 1, x: item.vx * DRIFT, y: item.vy * DRIFT }}
        exit={{ scale: 0.15, opacity: 0, x: item.vx * DRIFT * 1.8, y: item.vy * DRIFT * 1.8 }}
        transition={{
          scale:   { duration: 0.22, ease: [0.34, 1.3, 0.64, 1] },
          opacity: { duration: 0.18 },
          x:       { duration: 1.0, ease: 'easeOut' },
          y:       { duration: 1.0, ease: 'easeOut' },
        }}
      >
        <div style={{ transform: 'translate(-50%, -50%)' }}>
          <img
            src={item.src}
            alt=""
            style={{ maxWidth: maxW, width: 'auto', height: 'auto' }}
            draggable={false}
          />
        </div>
      </m.div>
    </div>
  );
}
