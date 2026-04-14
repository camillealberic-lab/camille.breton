'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projects } from '@/lib/projects';
import ArchivePanel from '@/components/ArchivePanel';
import { EASE_EXPO } from '@/lib/easing';
import { NAV_HEIGHT, SCROLL_THRESHOLD } from '@/lib/constants';
import {
  TextStaggerHover,
  TextStaggerHoverActive,
  TextStaggerHoverHidden,
} from '@/components/ui/text-stagger-hover';

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

function Media({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
  if (isVideo(src)) {
    return <video src={src} className={className} style={style} autoPlay muted loop playsInline />;
  }
  return <img src={src} alt="" className={className} style={style} />;
}
const ARCHIVE_IDX = projects.length;
const IMG_GAP     = 10;   // px — gap between images within a row
const ROW_GAP     = 112;  // px — gap between project rows (28 × 4)

// Aspect ratio 1512 × 862
const RATIO = 862 / 1512; // ≈ 0.5700

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const throttle    = useRef(false);
  const accumulated = useRef(0);
  const router      = useRouter();

  // Left strip ref — 2 image cells at 10vw each → rowH = (stripW - gap) / 2 × ratio
  const leftStripRef = useRef<HTMLDivElement>(null);
  const [rowH, setRowH] = useState(82);


  /* ── Derive rowH from one image-cell width ── */
  useEffect(() => {
    const measure = () => {
      if (!leftStripRef.current) return;
      const cellW = (leftStripRef.current.offsetWidth - IMG_GAP) / 2;
      setRowH(Math.round(cellW * RATIO));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (leftStripRef.current) ro.observe(leftStripRef.current);
    return () => ro.disconnect();
  }, []);

  const go = useCallback((dir: 1 | -1) => {
    if (throttle.current) return;
    throttle.current = true;
    setTimeout(() => { throttle.current = false; }, 600);
    setActiveIndex(prev => Math.max(0, Math.min(ARCHIVE_IDX, prev + dir)));
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      accumulated.current += e.deltaY;
      if (Math.abs(accumulated.current) >= SCROLL_THRESHOLD) {
        go(accumulated.current > 0 ? 1 : -1);
        accumulated.current = 0;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') go(1);
      if (e.key === 'ArrowUp')   go(-1);
    };
    window.addEventListener('wheel',   onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel',   onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [go]);

  const isArchive = activeIndex === ARCHIVE_IDX;

  /* ── Strip translation ──
     topPad = ROW_STEP so the previous project row is fully visible
     at the top of the container from index ≥ 1. */
  const ROW_STEP = rowH + ROW_GAP;
  const topPad   = ROW_STEP;
  const stripY   = topPad - activeIndex * ROW_STEP;

  const ease: [number, number, number, number] = EASE_EXPO;
  const transition = { duration: 0.75, ease };

  return (
    <>
      <main
        className="fixed inset-0 bg-cream overflow-hidden flex flex-col"
        style={{ paddingTop: NAV_HEIGHT }}
      >
        <div className="flex-1 flex min-h-0 px-4 pb-4 gap-3">

          {/* ── Left strip — 2 images per row (each 10vw) ────── */}
          {/* Width = 2 × 10vw + 1 × IMG_GAP */}
          <div
            ref={leftStripRef}
            className="flex-shrink-0 overflow-hidden relative"
            style={{ width: `calc(24vw + ${IMG_GAP}px)` }}
          >
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-cream to-transparent z-10 pointer-events-none" />
            <motion.div
              className="absolute top-0 left-0 right-0 flex flex-col"
              style={{ gap: ROW_GAP }}
              animate={{ y: stripY }}
              transition={transition}
            >
              {projects.map((project, i) => (
                <motion.div
                  key={project.slug}
                  animate={{ opacity: i === activeIndex ? 1 : 0.38 }}
                  transition={{ duration: 0.45 }}
                >
                  <Link
                    href={`/work/${project.slug}`}
                    data-cursor-zoom
                    className="flex flex-shrink-0"
                    style={{ height: rowH, gap: IMG_GAP }}
                  >
                    {(() => {
                      const coverNoClip = /henri[^/]*\/cover\.(jpg|png|webp)$/i.test(project.images.cover);
                      return (
                        <div className={`flex-1 ${coverNoClip ? 'overflow-visible' : 'overflow-hidden'}`}>
                          <Media src={project.images.cover} className={`w-full ${coverNoClip ? 'h-auto object-contain' : 'h-full object-cover'}`} />
                        </div>
                      );
                    })()}
                    <div className="flex-1 overflow-hidden">
                      <Media src={project.images.left} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                </motion.div>
              ))}
              <div style={{ height: rowH }} />
            </motion.div>
          </div>

          {/* ── Center nav ──────────────────────────────────── */}
          <div className="flex-1 relative flex flex-col justify-center pl-6 pr-14 min-w-0">
            <nav className="space-y-0">
              {projects.map((project, i) => {
                const isActive = i === activeIndex;
                return (
                  <div key={project.slug}>
                    <button
                      className="flex items-center gap-3 w-full text-left py-[0.25vh]"
                      onClick={() => {
                        if (isActive) router.push(`/work/${project.slug}`);
                        else setActiveIndex(i);
                      }}
                    >
                      <span
                        className="font-geologica font-semibold leading-tight text-ink transition-all duration-400 block"
                        style={{
                          fontSize:      isActive ? 'clamp(10px, 1vw, 19px)' : 'clamp(8px, 0.8vw, 15px)',
                          opacity:       isActive ? 1 : 0.15,
                          letterSpacing: isActive ? '-0.02em' : '0',
                        }}
                      >
                        <TextStaggerHover as="span">
                          <TextStaggerHoverActive animation="top" className="opacity-100">
                            {project.title}
                          </TextStaggerHoverActive>
                          <TextStaggerHoverHidden animation="bottom">
                            {project.title}
                          </TextStaggerHoverHidden>
                        </TextStaggerHover>
                      </span>
                      {isActive && (
                        <motion.span
                          className="font-montserrat text-[8px] tracking-[0.25em] uppercase text-ink/30 flex-shrink-0"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          ◄
                        </motion.span>
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Archive */}
              <div>
                <button
                  className="flex items-center gap-3 w-full text-left py-[0.25vh]"
                  onClick={() => setActiveIndex(ARCHIVE_IDX)}
                >
                  <span
                    className="font-geologica font-semibold leading-tight text-ink transition-all duration-400 block"
                    style={{
                      fontSize:      isArchive ? 'clamp(10px, 1vw, 19px)' : 'clamp(8px, 0.8vw, 15px)',
                      opacity:       isArchive ? 1 : 0.12,
                      letterSpacing: isArchive ? '-0.02em' : '0',
                    }}
                  >
                    <TextStaggerHover as="span">
                      <TextStaggerHoverActive animation="top" className="opacity-100">
                        Archive
                      </TextStaggerHoverActive>
                      <TextStaggerHoverHidden animation="bottom">
                        Archive
                      </TextStaggerHoverHidden>
                    </TextStaggerHover>
                  </span>
                  {isArchive && (
                    <motion.span
                      className="font-montserrat text-[8px] tracking-[0.25em] uppercase text-ink/30 flex-shrink-0"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      ◄
                    </motion.span>
                  )}
                </button>
              </div>
            </nav>

            {/* Project number */}
            <div className="absolute left-0 pointer-events-none" style={{ bottom: '0.3rem' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIndex}
                  className="font-geologica font-black leading-none text-ink select-none"
                  style={{ fontSize: 'clamp(48px, 6.5vw, 100px)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  {isArchive ? '↗' : String(activeIndex + 1).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right strip — 4 images per row (each 10vw) ───── */}
          {/* Width = 4 × 10vw + 3 × IMG_GAP */}
          <div
            className="flex-shrink-0 overflow-hidden relative"
            style={{ width: `calc(48vw + ${IMG_GAP * 3}px)` }}
          >
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-cream to-transparent z-10 pointer-events-none" />
            <motion.div
              className="absolute top-0 left-0 right-0 flex flex-col"
              style={{ gap: ROW_GAP }}
              animate={{ y: stripY }}
              transition={transition}
            >
              {projects.map((project, i) => {
                const d     = project.images.detail;
                const count = project.homeCount ?? 4;
                const imgs  = Array.from({ length: count }, (_, i) => d[i] ?? project.images.cover);
                return (
                  <motion.div
                    key={project.slug}
                    animate={{ opacity: i === activeIndex ? 1 : 0.38 }}
                    transition={{ duration: 0.45 }}
                  >
                    <Link
                      href={`/work/${project.slug}`}
                      data-cursor-zoom
                      className="flex flex-shrink-0"
                      style={{ height: rowH, gap: IMG_GAP }}
                    >
                      {imgs.map((src, j) => {
                        const noClip = /mobile\.(jpg|png|webp)$/i.test(src) || /la-boutik-deco\/6\.webp$/i.test(src);
                        return (
                          <div key={j} className={`flex-1 ${noClip ? 'overflow-visible' : 'overflow-hidden'}`}>
                            <Media src={src} className={`w-full ${noClip ? 'h-auto object-contain' : 'h-full object-cover'}`} />
                          </div>
                        );
                      })}
                    </Link>
                  </motion.div>
                );
              })}
              <div style={{ height: rowH }} />
            </motion.div>
          </div>

        </div>
      </main>

      <ArchivePanel visible={isArchive} />
    </>
  );
}
