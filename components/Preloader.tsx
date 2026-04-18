'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { EASE_OUT } from '@/lib/easing';

const COLORS    = ['var(--orange)', 'var(--blue)', 'var(--green)'];
const SIZE      = 130;
const DURATION  = 3000;
const MIN_DIST  = 70; // desktop mousemove trail

type ShapeKind = 'circle' | 'square';
const SHAPE_SEQ: ShapeKind[] = ['circle','square','square','circle','square','circle','circle','square'];

interface TrailItem {
  id:    number;
  x:     number;
  y:     number;
  color: string;
  shape: ShapeKind;
  vx:    number;
  vy:    number;
}

export default function Preloader() {
  const [visible,  setVisible]  = useState(true);
  const [count,    setCount]    = useState(0);
  const [trail,    setTrail]    = useState<TrailItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const counter  = useRef(0);
  const colorIdx = useRef(0);
  const shapeIdx = useRef(0);
  const rafRef   = useRef<number | null>(null);
  // Desktop trail refs
  const lastPos  = useRef({ x: -9999, y: -9999 });
  const prevPos  = useRef({ x: -9999, y: -9999 });

  /* ── Detect mobile once ───────────────────────────── */
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  /* ── Counter 0 → 100 ─────────────────────────────── */
  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const linear = Math.min((now - start) / DURATION, 1);
      const eased  = 1 - Math.pow(1 - linear, 2.4);
      setCount(Math.floor(eased * 100));
      if (linear < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    const timer = setTimeout(() => setVisible(false), DURATION + 200);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
    };
  }, []);

  /* ── Shared spawn ────────────────────────────────── */
  const spawn = useCallback((x: number, y: number, vx: number, vy: number) => {
    const id    = ++counter.current;
    const color = COLORS[colorIdx.current % COLORS.length];
    colorIdx.current++;
    const shape = SHAPE_SEQ[shapeIdx.current % SHAPE_SEQ.length];
    shapeIdx.current++;
    setTrail(prev => [...prev.slice(-8), { id, x, y, color, shape, vx, vy }]);
    setTimeout(() => setTrail(prev => prev.filter(t => t.id !== id)), 1600);
  }, []);

  /* ── Desktop: mousemove trail ────────────────────── */
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

  /* ── Mobile: click to spawn ──────────────────────── */
  const onClick = useCallback((e: MouseEvent) => {
    const angle = (Math.random() - 0.5) * Math.PI;
    const vx = Math.sin(angle);
    const vy = -Math.abs(Math.cos(angle)) * 0.6;
    spawn(e.clientX, e.clientY, vx, vy);
  }, [spawn]);

  /* ── Bind correct handler ────────────────────────── */
  useEffect(() => {
    if (isMobile) {
      window.addEventListener('click', onClick);
      return () => window.removeEventListener('click', onClick);
    } else {
      window.addEventListener('mousemove', onMouseMove);
      return () => window.removeEventListener('mousemove', onMouseMove);
    }
  }, [isMobile, onClick, onMouseMove]);

  const pad = (n: number) => String(n).padStart(3, '0');

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          className="fixed inset-0 bg-cream z-[9998] overflow-hidden cursor-none select-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: EASE_OUT }}
        >
          {/* Trail shapes */}
          <AnimatePresence>
            {trail.map(item => (
              <TrailShape key={item.id} item={item} />
            ))}
          </AnimatePresence>

          {/* Counter — bas-droite */}
          <m.div
            className="absolute bottom-0 right-0 pr-10 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="relative">
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{ height: '52%', backgroundColor: 'rgba(0,0,0,0.05)', marginLeft: '-1.5rem', marginRight: '-1rem' }}
              />
              <p
                className="relative font-geologica font-black leading-none text-ink tabular-nums"
                style={{ fontSize: 'clamp(44px, 8vw, 132px)' }}
              >
                {pad(count)}
              </p>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

/* ── Individual shape ───────────────────────────────────────────── */
const DRIFT = 60;

function TrailShape({ item }: { item: TrailItem }) {
  const isCircle = item.shape === 'circle';
  return (
    <m.div
      className="absolute pointer-events-none"
      style={{ left: item.x, top: item.y, translateX: '-50%', translateY: '-50%' }}
      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      animate={{ scale: 1, opacity: 1, x: item.vx * DRIFT, y: item.vy * DRIFT * 2 }}
      exit={{ scale: 0.1, opacity: 0, x: item.vx * DRIFT * 1.8, y: item.vy * DRIFT * 3 }}
      transition={{
        scale:   { duration: 0.25, ease: [0.34, 1.3, 0.64, 1] },
        opacity: { duration: 0.2 },
        x:       { duration: 1.4, ease: 'easeOut' },
        y:       { duration: 1.4, ease: 'easeOut' },
      }}
    >
      <div
        style={{
          width:           SIZE,
          height:          SIZE,
          backgroundColor: item.color,
          borderRadius:    isCircle ? '50%' : '0%',
        }}
      />
    </m.div>
  );
}
