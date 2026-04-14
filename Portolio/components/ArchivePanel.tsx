'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_OUT } from '@/lib/easing';
/* ── Archive images — images réelles du dossier archive ─── */
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
  const mouseRef = useRef({ x: -999, y: -999 }); // always up-to-date mouse pos
  const lastPos  = useRef({ x: -9999, y: -9999 });
  const prevPos  = useRef({ x: -9999, y: -9999 });
  const counter  = useRef(0);
  const imgIdx   = useRef(0);

  useEffect(() => setMounted(true), []);

  /* ── Track mouse at all times so cursor is ready on open ── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ── Snap to current position immediately when panel opens ── */
  useEffect(() => {
    if (visible) setCursorPos({ x: mouseRef.current.x, y: mouseRef.current.y });
  }, [visible]);

  /* ── Mouse trail ───────────────────────────────────── */
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

    const id  = ++counter.current;
    const src = ARCHIVE_IMGS[imgIdx.current % ARCHIVE_IMGS.length];
    imgIdx.current++;

    const cx = Math.max(IMG_W / 2, Math.min(e.clientX, window.innerWidth  - IMG_W / 2));
    const cy = Math.max(IMG_H / 2, Math.min(e.clientY, window.innerHeight - IMG_H / 2));
    setTrail((prev) => [...prev.slice(-5), { id, x: cx, y: cy, src, vx, vy }]);
    setTimeout(() => setTrail((prev) => prev.filter((t) => t.id !== id)), 1400);
  }, []);

  useEffect(() => {
    if (!visible) { setTrail([]); return; }
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [visible, onMouseMove]);

  if (!mounted) return null;

  const panelY = visible ? '0%' : '100%';

  return createPortal(
    <motion.div
      data-cursor-archive
      className="fixed inset-0 z-[60] overflow-hidden select-none"
      style={{ backgroundColor: 'var(--green)', cursor: 'none' }}
      initial={{ y: '100%' }}
      animate={{ y: panelY }}
      transition={{ duration: 0.75, ease: EASE_OUT }}
    >
      {/* Trail images */}
      <AnimatePresence>
        {trail.map((item) => (
          <TrailImage key={item.id} item={item} />
        ))}
      </AnimatePresence>

      {/* "Archive" centré */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.h1
          className="font-geologica font-bold text-cream select-none"
          style={{ fontSize: 'clamp(64px, 11vw, 172px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
          transition={{ duration: 0.55, delay: visible ? 0.25 : 0, ease: EASE_OUT }}
        >
          Archive
        </motion.h1>
      </div>

      {/* Text cursor — follows mouse, replaces the dot */}
      <div
        className="pointer-events-none fixed z-[9999]"
        style={{
          left: cursorPos.x,
          top:  cursorPos.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <p className="font-montserrat text-[8px] tracking-[0.45em] uppercase text-white whitespace-nowrap">
          Move cursor
        </p>
      </div>
    </motion.div>,
    document.body
  );
}

/* ── Single trail image ─────────────────────────────── */
function TrailImage({ item }: { item: TrailItem }) {
  const isSmall = item.src.includes('corvus') || item.src.includes('deus');
  const maxW = isSmall ? 260 : 420;

  return (
    /* Positionné au curseur — le centrage est sur l'inner div,
       le drift (x/y framer) sur le motion.div pour ne pas écraser le translate */
    <div
      className="absolute pointer-events-none"
      style={{ left: item.x, top: item.y }}
    >
      <motion.div
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
        {/* Centrage indépendant du drift */}
        <div style={{ transform: 'translate(-50%, -50%)' }}>
          <img
            src={item.src}
            alt=""
            style={{ maxWidth: maxW, width: 'auto', height: 'auto' }}
            draggable={false}
          />
        </div>
      </motion.div>
    </div>
  );
}
