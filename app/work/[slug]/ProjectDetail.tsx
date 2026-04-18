'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m, useAnimation } from 'framer-motion';
import { Project } from '@/lib/projects';
import { EASE_OUT, EASE_EXPO } from '@/lib/easing';
import { SCROLL_THRESHOLD_PROJECT as SCROLL_THRESHOLD } from '@/lib/constants';
import LazyVideo from '@/components/LazyVideo';

interface Props { project: Project; nextProject: Project; }


// Module-level flag: persists across SPA navigations, consumed synchronously
// in useState initializer — zero flash, zero timing issues
let _fromSlide = false;

type LenisInstance = { scroll: number; scrollTo: (t: number, o?: Record<string, unknown>) => void };
const getLenis = () => (typeof window !== 'undefined' ? (window as unknown as { __lenis?: LenisInstance }).__lenis : undefined);

export default function ProjectDetail({ project, nextProject }: Props) {
  // Consumed synchronously → correct on first render, no flash
  const [skipReveal] = useState<boolean>(() => { const v = _fromSlide; _fromSlide = false; return v; });
  const [revealed,   setRevealed]  = useState(skipReveal);
  const [progress,   setProgress]  = useState(0);
  const exitingRef    = useRef(false);
  const accumulated   = useRef(0);
  const touchStartY   = useRef(0);
  const touchAcc      = useRef(0);
  const controls      = useAnimation();
  const router        = useRouter();

  /* ── Mount: native scroll reset (belt-and-suspenders) ──────────────────
     SmoothScrollProvider's useLayoutEffect([pathname]) is the canonical
     owner: it resets Lenis to 0 AND calls lenis.stop() before this paint,
     blocking all residual wheel/touch momentum from the previous page.
     This effect handles the native scroll APIs as an extra safety layer.
  ────────────────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Mount: trigger reveal animation only ───────────────────────────── */
  useEffect(() => {
    if (!skipReveal) {
      const t = setTimeout(() => setRevealed(true), 80);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Slide to next ─────────────────────────────── */
  const goToNext = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setProgress(1);
    controls.start({
      x: '-100vw',
      transition: { duration: 0.72, ease: EASE_EXPO },
    }).then(() => {
      // Reset scroll before navigation. scrollTo(0, immediate) sets
      // animatedScroll=targetScroll=0, calls window.scrollTo(0), stops
      // the lerp, and prevents the next native scroll event from overriding.
      // Do NOT call lenis.stop() — it blocks scrollTo() when isStopped=true.
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(0, { immediate: true });
      _fromSlide = true;  // consumed by next page's useState initializer
      // scroll: false — disable Next.js scroll management, we handle it manually
      router.push(`/work/${nextProject.slug}`, { scroll: false });
    });
  }, [controls, router, nextProject.slug]);

  /* ── Wheel accumulator ─────────────────────────── */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (exitingRef.current) return;
      const l = getLenis();
      const scrollY = l ? l.scroll : window.scrollY;
      const atBottom = scrollY + window.innerHeight >= document.documentElement.scrollHeight - 150;
      if (!atBottom) { accumulated.current = 0; setProgress(0); return; }
      if (e.deltaY <= 0) {
        accumulated.current = Math.max(0, accumulated.current - Math.abs(e.deltaY) * 0.5);
        setProgress(accumulated.current / SCROLL_THRESHOLD);
        return;
      }
      accumulated.current += e.deltaY;
      setProgress(Math.min(accumulated.current / SCROLL_THRESHOLD, 1));
      if (accumulated.current >= SCROLL_THRESHOLD) goToNext();
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [goToNext]);

  /* ── Touch: swipe-up at bottom → next project ────────────────────────
     Same logic as the wheel accumulator but driven by finger position.
     TOUCH_THRESHOLD is lower than the wheel threshold (260 px) because
     raw touch deltas are real CSS pixels — 120 px of deliberate upward
     swipe is enough signal without being too hair-trigger.
  ── */
  useEffect(() => {
    const TOUCH_THRESHOLD = 120;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (exitingRef.current) return;
      const l = getLenis();
      const scrollY  = l ? l.scroll : window.scrollY;
      const atBottom = scrollY + window.innerHeight >= document.documentElement.scrollHeight - 150;

      const dy = touchStartY.current - e.touches[0].clientY; // positive = swipe up
      touchStartY.current = e.touches[0].clientY;            // incremental delta

      if (!atBottom) { touchAcc.current = 0; setProgress(0); return; }
      if (dy <= 0) {
        touchAcc.current = Math.max(0, touchAcc.current - Math.abs(dy) * 0.5);
        setProgress(touchAcc.current / TOUCH_THRESHOLD);
        return;
      }
      touchAcc.current += dy;
      setProgress(Math.min(touchAcc.current / TOUCH_THRESHOLD, 1));
      if (touchAcc.current >= TOUCH_THRESHOLD) goToNext();
    };
    const onTouchEnd = () => {
      if (!exitingRef.current) { touchAcc.current = 0; setProgress(0); }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, [goToNext]);

  return (
    <div className="overflow-x-hidden">

      {/* Curtain: ink from top (direct entry) | cream from right (slide) */}
      {skipReveal ? (
        <m.div
          className="fixed inset-0 bg-cream z-[55] pointer-events-none"
          initial={{ x: '0%' }}
          animate={{ x: '-100%' }}
          transition={{ duration: 0.55, ease: EASE_EXPO }}
        />
      ) : (
        <m.div
          className="fixed inset-0 bg-ink z-[55] pointer-events-none"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: revealed ? 0 : 1 }}
          transition={{ duration: 0.9, ease: EASE_EXPO }}
          style={{ transformOrigin: 'top' }}
        />
      )}

      {/* Page */}
      <m.main className="bg-cream min-h-screen" animate={controls}>

        {/* Hero */}
        {/* Responsive objectPosition: mobile uses detailCoverPosition, desktop uses detailCoverPositionDesktop */}
        {(project.detailCoverPosition || project.detailCoverPositionDesktop || project.detailHeroHeightMobile) && (
          <style dangerouslySetInnerHTML={{ __html:
            (project.detailCoverPosition || project.detailCoverPositionDesktop
              ? `.hero-cover-img{object-position:${project.detailCoverPosition ?? 'center'}}@media(min-width:768px){.hero-cover-img{object-position:${project.detailCoverPositionDesktop ?? project.detailCoverPosition ?? 'center'}}}`
              : '') +
            (project.detailHeroHeightMobile
              ? `.hero-container-mobile{height:${project.detailHeroHeightMobile}}@media(min-width:768px){.hero-container-mobile{height:75vh}}`
              : '')
          }} />
        )}
        <m.div
          className={`w-full overflow-hidden${project.detailHeroHeightMobile ? ' hero-container-mobile' : ' h-[75vh]'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ delay: skipReveal ? 0 : 0.5, duration: 0.7 }}
        >
          {(() => {
            const heroSrc = project.detailCover ?? project.images.cover;
            const isVid = /\.(mp4|webm|mov)$/i.test(heroSrc);
            const imgClassName = `w-full h-full object-cover${project.detailCoverPosition || project.detailCoverPositionDesktop ? ' hero-cover-img' : ''}`;
            return isVid ? (
              <video src={heroSrc} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            ) : project.detailCoverMobile ? (
              <picture>
                <source media="(max-width: 767px)" srcSet={project.detailCoverMobile} />
                <m.img
                  src={heroSrc}
                  alt={project.title}
                  className={imgClassName}
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.4, ease: EASE_OUT }}
                />
              </picture>
            ) : (
              <m.img
                src={heroSrc}
                alt={project.title}
                className={imgClassName}
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.4, ease: EASE_OUT }}
              />
            );
          })()}
        </m.div>

        {/* Meta */}
        <m.div
          className="px-8 md:px-16 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-ink/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
          transition={{ delay: skipReveal ? 0 : 0.7, duration: 0.7 }}
        >
          <div>
            <p className="font-montserrat text-[10px] tracking-[0.4em] uppercase text-ink/55 mb-2">{project.category}</p>
            <h1 className="font-geologica text-[5vw] font-bold uppercase leading-none text-ink">{project.title}</h1>
          </div>
          <div className="flex gap-10 items-end">
            <div>
              <p className="font-montserrat text-[9px] tracking-[0.35em] uppercase text-ink/25 mb-1">Year</p>
              <p className="font-montserrat text-[11px] tracking-[0.2em] text-ink">{project.year}</p>
            </div>
            <div>
              <p className="font-montserrat text-[9px] tracking-[0.35em] uppercase text-ink/25 mb-1">Tools</p>
              <p className="font-montserrat text-[11px] tracking-[0.15em] text-ink">{project.tools.join(' — ')}</p>
            </div>
          </div>
        </m.div>

        {/* Description */}
        <m.div
          className="px-8 md:px-16 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 30 }}
          transition={{ delay: skipReveal ? 0 : 0.85, duration: 0.8 }}
        >
          <div>
            <p className="font-montserrat text-[10px] tracking-[0.4em] uppercase text-ink/25 mb-6">About the project</p>
            <h2 className="font-geologica text-[5.5vw] md:text-[2.2vw] font-semibold uppercase leading-tight text-ink">{project.shortDesc}</h2>
          </div>
          <div className="flex items-end">
            <p className="font-montserrat text-[13px] leading-[1.85] text-ink/70">{project.description}</p>
          </div>
        </m.div>

        {/* Gallery */}
        {project.slug === 'ethkwear' ? (

          /* ── Ethkwear custom layout ────────────────────────────── */
          <div className="pb-0">

            {/* 1 — Main video */}
            {project.video && (
              <m.div
                className="px-8 md:px-16"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease: EASE_OUT }}
              >
                <video src={project.video} className="w-full h-auto" autoPlay muted loop playsInline />
              </m.div>
            )}

            {/* 2 — Text (left) + Menu_d image (right) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[55vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">UX / UI</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Des choix pensés pour l'usage</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Chaque écran a été conçu autour d'une navigation instinctive : hiérarchie visuelle claire, typographie lisible et contrastée, zones de clic généreuses. La priorité était de rendre l'expérience fluide du menu jusqu'à la fiche produit, sans surcharge cognitive — dans le respect des principes d'ergonomie web.
                </p>
              </div>
              <div className="flex-1">
                <img
                  src="/projects/ethikwear/Menu_d.webp"
                  alt=""
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </m.div>

            {/* 3 — mobile.png full width */}
            <m.div
              className="px-8 md:px-16 mt-5"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <img src="/projects/ethikwear/mobile.webp" alt="" className="w-full h-auto" loading="lazy" />
            </m.div>

            {/* 4 — text (mobile top) + Product_d image (mobile bottom) */}
            <m.div
              className="flex flex-col-reverse md:flex-row md:min-h-[55vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="flex-1">
                <img src="/projects/ethikwear/Product_d.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6 md:pl-4">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Mobile First</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Conçu mobile, adapté à tous les écrans</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  La maquette a été pensée en mobile first — chaque composant conçu d'abord pour les petits écrans, puis adapté progressivement au desktop. Un exercice de rigueur qui force à prioriser l'essentiel et à ne rien sacrifier sur le responsive. La page produit en particulier a fait l'objet de choix réfléchis : disposition claire, informations hiérarchisées, CTA mis en valeur — pour garantir une expérience d'achat efficace dès le mobile.
                </p>
              </div>
            </m.div>
          </div>

        ) : project.slug === 'jacquemus' ? (

          /* ── Jacquemus custom layout ───────────────────────────── */
          <div className="pb-0">

            {/* 1 — Main video, with sound */}
            {project.video && (
              <m.div
                className="px-8 md:px-16"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease: EASE_OUT }}
              >
                <video
                  src={project.video}
                  className="w-full h-auto"
                  autoPlay
                  loop
                  playsInline
                />
              </m.div>
            )}

            {/* 2 — Text (left) + image (right) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[55vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Process</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Les textures, le vrai défi</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  La modélisation en elle-même n'était pas le plus difficile. C'est la réalisation des textures — notamment le verre et la roche — qui a représenté le vrai challenge. Comprendre les nodes de matériaux dans Blender, paramétrer la réfraction, la rugosité et l'interaction lumière-matière sur des surfaces aussi différentes a demandé de nombreux essais.
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <img
                  src="/projects/jacquemus/P_topleft.webp"
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </m.div>

            {/* 3 — Full-width media */}
            {project.images.detail[1] && (() => {
              const vid = /\.(mp4|webm|mov)$/i.test(project.images.detail[1]);
              return (
                <m.div
                  className="px-8 md:px-16 mt-10 md:mt-5"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.9, ease: EASE_OUT }}
                >
                  {vid ? (
                    <video src={project.images.detail[1]} className="w-full h-auto" autoPlay muted loop playsInline />
                  ) : (
                    <img src={project.images.detail[1]} alt="" className="w-full object-cover h-[60vh]" loading="lazy" />
                  )}
                </m.div>
              );
            })()}

            {/* 4 — Image (left) + text (right) */}
            {project.images.detail[2] && (
              <m.div
                className="flex md:min-h-[55vh] mt-5 px-8 md:px-16"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease: EASE_OUT }}
              >
                <div className="flex-1 overflow-hidden">
                  {/\.(mp4|webm|mov)$/i.test(project.images.detail[2]) ? (
                    <video src={project.images.detail[2]} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <img src={project.images.detail[2]} alt="" className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6 md:pl-12">
                  <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Process</p>
                  <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Les lavendes et le bake</h3>
                  <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                    Modéliser les lavendes a été l'exercice le plus laborieux — et celui dont je suis malheureusement le moins satisfait. Leur forme organique et répétitive reste difficile à maîtriser à ce stade. En parallèle, comprendre le bake de compactage et la gestion des collisions entre éléments a été une notion clé pour finaliser la scène correctement.
                  </p>
                </div>
              </m.div>
            )}

            {/* 5 — Final full-width media */}
            {project.images.detail[3] && (() => {
              const vid = /\.(mp4|webm|mov)$/i.test(project.images.detail[3]);
              return (
                <m.div
                  className="px-8 md:px-16 mt-5"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.9, ease: EASE_OUT }}
                >
                  {vid ? (
                    <video src={project.images.detail[3]} className="w-full h-auto" autoPlay muted loop playsInline />
                  ) : (
                    <img src={project.images.detail[3]} alt="" className="w-full object-cover h-[60vh]" loading="lazy" />
                  )}
                </m.div>
              );
            })()}
          </div>

        ) : project.slug === 'barbershop-shift-bordeaux' ? (

          /* ── Shift custom layout ───────────────────────────────── */
          <div className="pb-0">

            {/* 1 — Positionnement : texte (gauche) + 4.webp (droite) */}
            <m.div
              className="flex flex-col-reverse md:flex-row md:min-h-[60vh] px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Positionnement</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Redéfinir l&apos;identité avant tout</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Premier constat : une tendance à l&apos;uniformisation face à la concurrence, malgré une vraie volonté de se distinguer. Le positionnement a été affiné autour d&apos;un axe fort — barber nouvelle génération, qui comprend le style avant de couper. Offre premium accessible (20 €), identité marquée sur les réseaux, cible 18-35 ans sensibles à leur image. Sur le plan business : de 500 € de CA actuel à 3 000-4 000 € net/mois en 12 mois, via une montée en charge progressive et une structuration des outils de suivi.
                </p>
              </div>
              <div className="flex-1">
                <img src="/projects/shift/4.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
            </m.div>

            {/* 2 — 3.webp (gauche) + texte identité visuelle (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="flex-1">
                <img src="/projects/shift/3.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Identité Visuelle</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Une identité visuelle forte devrait être structurée</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Face à un logo existant peu différenciant, l&apos;enjeu était de construire une identité cohérente, mémorable et à la hauteur des ambitions de la marque — sans trahir ce qui existait, mais en le structurant pour qu&apos;il devienne réellement lisible et percutant.
                </p>
              </div>
            </m.div>

            {/* 3 — 5.webp pleine largeur */}
            <m.div
              className="px-8 md:px-16 mt-5"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <img src="/projects/shift/5.webp" alt="" className="w-full h-auto" loading="lazy" />
            </m.div>

            {/* 4 — Texte plan de com (gauche) + 3b.webp (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Plan de Communication</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">90 jours d&apos;actions structurées</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Un plan de communication clair et actionnable, structuré en 4 phases sur 12 semaines : Fondation, Activation, Désirabilité, Consolidation. Chaque phase se déclenche sur des indicateurs réels — pas sur un calendrier. 5 piliers de contenu définis (Diagnostic & Process, Transformation avant/après, Volume & Flux, Identité, Preuve sociale) répartis sur Instagram Reels, TikTok et Stories. Objectif final : une base clients récurrente et un CA net à 3 000–4 000 € /mois à 12 mois.
                </p>
              </div>
              <div className="flex-1">
                <img src="/projects/shift/3b.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
            </m.div>

          </div>

        ) : project.slug === 'henri-cartier-bresson' ? (

          /* ── Henri Cartier-Bresson custom layout ───────────────── */
          <div className="pb-0">

            {/* 1 — 2.mp4 full width */}
            <m.div
              className="px-8 md:px-16"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <LazyVideo src="/projects/henri%20cartier%20bresson/2.mp4" className="w-full h-auto" />
            </m.div>

            {/* 2 — Image (right) + texte (bas gauche) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[38%] flex flex-col justify-end pb-0 md:pb-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Direction Artistique</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Définir une DA au service de l&apos;œuvre</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Parti pris minimaliste : épurer l&apos;interface pour que les photographies occupent le premier plan. Deux couleurs choisies en écho à l&apos;artiste — orange pour la créativité, brun pour l&apos;ancrage identitaire et naturel.
                </p>
              </div>
              <div className="flex-1">
                <img src="/projects/henri%20cartier%20bresson/3.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
            </m.div>

            {/* 3 — Video_3.mp4 full width */}
            <m.div
              className="px-8 md:px-16 mt-5"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <LazyVideo src="/projects/henri%20cartier%20bresson/Video_3.mp4" className="w-full h-auto" />
            </m.div>

            {/* 4 — 1.webp (gauche) + texte (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="flex-1">
                <img src="/projects/henri%20cartier%20bresson/1.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
              <div className="w-full md:w-[38%] flex flex-col justify-end pb-0 md:pb-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">UX & Accessibilité</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Pensé mobile, conçu pour tous</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Usage majoritairement mobile, rapide et intuitif — le site a été pensé en mobile first. La cible vieillissante a aussi guidé les choix : structure simple, lisibilité maximale, aucune ambiguïté de parcours.
                </p>
              </div>
            </m.div>

            {/* 5 — 4.mp4 full width */}
            <m.div
              className="px-8 md:px-16 mt-5"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <LazyVideo src="/projects/henri%20cartier%20bresson/4.mp4" className="w-full h-auto" />
            </m.div>

            {/* 6 — texte (gauche) + 6.webp (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[38%] flex flex-col justify-end pb-0 md:pb-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Contact & Agence</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Une page contact au service de la fondation</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  La fondation reçoit des demandes variées — expositions, presse, acquisitions. La page contact a été conçue comme un vrai canal professionnel, calqué sur un modèle agence : structuré, crédible, à la hauteur du nom.
                </p>
              </div>
              <div className="flex-1">
                <img src="/projects/henri%20cartier%20bresson/6.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
            </m.div>

          </div>

        ) : project.slug === 'la-boutik-deco' ? (

          /* ── La Boutik Deco custom layout ─────────────────────── */
          <div className="pb-0">

            {/* 1 — 4.mp4 pleine largeur */}
            <m.div
              className="px-8 md:px-16"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <LazyVideo src="/projects/la-boutik-deco/4.mp4" className="w-full h-auto" />
            </m.div>

            {/* 2 — Texte charte graphique (gauche) + 10.webp (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Charte Graphique</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Le bleu conservé, les polices modernisées, l&apos;orange ajouté</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  L&apos;identité existante portait déjà un bleu installé — reconnu, ancré. Le parti pris : ne pas l&apos;effacer, mais le reléguer en couleur d&apos;accent. La couleur principale devient l&apos;orange — plus identitaire, plus chaleureux, plus distinctif. Un choix fort qui restructure la hiérarchie chromatique sans rompre avec ce qui existait.
                </p>
              </div>
              <div className="flex-1">
                <img src="/projects/la-boutik-deco/10.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
            </m.div>

            {/* 3 — 7.mp4 (gauche, hauteur fixe proportionnelle) + texte mobile first (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:items-center md:justify-start md:h-[60vh] mt-5 px-8 md:px-16 gap-8 md:gap-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="flex items-center md:h-full w-full md:w-auto">
                <img src="/projects/la-boutik-deco/6.1.webp" alt="" className="hidden md:block h-full w-auto" loading="lazy" />
                <LazyVideo src="/projects/la-boutik-deco/7.mp4" className="w-full md:w-auto md:h-full md:ml-[7px]" />
              </div>
              <div className="w-full md:w-[36%] flex flex-col justify-center gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Mobile First</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Conçu mobile, adapté à tous les formats</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  La majorité des clients de la boutique naviguent depuis leur téléphone. Chaque élément de la charte a donc été pensé pour fonctionner d&apos;abord sur petit écran : tailles de texte lisibles sans zoom, contrastes renforcés, mise en page aérée. Un design qui s&apos;adapte — pas qui contraint.
                </p>
              </div>
            </m.div>

            {/* 4 — 1.mp4 pleine largeur */}
            <m.div
              className="px-8 md:px-16 mt-5"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <LazyVideo src="/projects/la-boutik-deco/1.mp4" className="w-full h-auto" />
            </m.div>

            {/* 5 — Texte UX (gauche) + 3.webp (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:items-center md:justify-start md:min-h-[60vh] mt-5 px-8 md:px-16 gap-8 md:gap-32"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[38%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Pages Projet</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Une page efficace, pensée selon les lois UX</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Loi de Hick, hiérarchie visuelle, charge cognitive réduite — chaque choix de mise en page a été guidé par des principes UX concrets. L&apos;objectif : une page projet lisible en un coup d&apos;œil, qui inspire confiance et oriente l&apos;utilisateur naturellement vers l&apos;essentiel, sans friction.
                </p>
              </div>
              <div className="w-auto">
                <img src="/projects/la-boutik-deco/3.webp" alt="" className="h-auto" style={{ maxHeight: '60vh' }} loading="lazy" />
              </div>
            </m.div>

          </div>

        ) : project.slug === 'queen' ? (

          /* ── Queen custom layout ───────────────────────────────── */
          <div className="pb-0">

            {/* 1 — 1.mp4 pleine largeur */}
            <m.div
              className="px-8 md:px-16"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <LazyVideo src="/projects/queen/1.mp4" className="w-full h-auto" />
            </m.div>

            {/* 2 — Texte maquettage (gauche) + 10.webp (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Maquettage & UX</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Relier la cible, les lois UX et la vision de l&apos;artiste</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Avant de toucher à Figma, il fallait comprendre : qui visite un site Queen, qu&apos;attend-il, et comment l&apos;univers visuel du groupe peut-il guider chaque décision de design ? Le maquettage en groupe a été une réflexion collective sur cet équilibre — entre attentes UX documentées, lois d&apos;ergonomie web, et une DA fidèle à l&apos;identité iconique de Queen.
                </p>
              </div>
              <div className="flex-1">
                <img src="/projects/queen/10.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
            </m.div>

            {/* 3 — 2.webp (gauche) + texte prototypage (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="flex-1">
                <img src="/projects/queen/2.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Chef de Projet</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Organiser l&apos;héritage d&apos;un groupe iconique</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Après coordination des phases projet — audit, wireframes, charte, design — l&apos;enjeu central était l&apos;organisation des contenus artistiques. Queen, c&apos;est plus de 50 ans de discographie : albums studio, lives, compilations, projets solo. Structurer cette matière de façon claire et navigable, sans trahir l&apos;identité visuelle du groupe, a guidé chaque décision d&apos;architecture de l&apos;information — de la présentation des albums à la mise en valeur des projets artistiques emblématiques.
                </p>
              </div>
            </m.div>

            {/* 4 — 4.mp4 pleine largeur */}
            <m.div
              className="px-8 md:px-16 mt-5"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <LazyVideo src="/projects/queen/4.mp4" className="w-full h-auto" />
            </m.div>

            {/* 5 — 5.mp4 (gauche) + texte expériences en scroll (droite) */}
            <m.div
              className="flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="flex-1">
                <LazyVideo src="/projects/queen/5.mp4" className="w-full h-auto" />
              </div>
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Expériences & Navigation</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Un scroll continu pour traverser l&apos;univers Queen</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  Chaque projet artistique — album, tournée, film — est présenté comme une expérience immersive accessible en scroll vertical continu. Ce choix UX répond à une logique narrative : l&apos;utilisateur ne consulte pas, il traverse. La fluidité du défilement renforce le sentiment d&apos;être dans un univers cohérent, fidèle à l&apos;ambition scénique de Queen — chaque section s&apos;enchaîne comme un acte, sans rupture ni redirection forcée.
                </p>
              </div>
            </m.div>

            {/* 6 — texte page produit UX (gauche) + 12.webp (droite) */}
            <m.div
              className="flex flex-col-reverse md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            >
              <div className="w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6">
                <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/30">Page Produit</p>
                <h3 className="font-geologica text-[4.5vw] md:text-[1.6vw] font-semibold leading-tight text-ink">Une page produit à la hauteur du catalogue</h3>
                <p className="font-montserrat text-[13px] leading-[1.85] text-ink/60">
                  La page produit a été pensée selon les principes UX éprouvés : hiérarchie visuelle forte, information progressive, CTA clairement mis en valeur. L&apos;image occupe l&apos;espace dominant — conformément à la loi de Jakob, l&apos;utilisateur s&apos;attend à retrouver les conventions du e-commerce. Le titre, le prix et l&apos;action d&apos;achat sont placés dans la zone de lecture naturelle, sans friction, avec une typographie au service du contenu et non de la décoration.
                </p>
              </div>
              <div className="flex-1">
                <img src="/projects/queen/12.webp" alt="" className="w-full h-auto" loading="lazy" />
              </div>
            </m.div>

          </div>

        ) : (

          /* ── Standard gallery for all other projects ───────────── */
          <div className="px-8 md:px-16 pb-0 space-y-5">
            {project.video && (
              <m.div
                className="w-full"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease: EASE_OUT }}
              >
                <video src={project.video} className="w-full h-auto" autoPlay muted loop playsInline />
              </m.div>
            )}
            {project.images.detail.map((src, i) => {
              const vid = /\.(mp4|webm|mov)$/i.test(src);
              const isMobile = !vid && /_m\.[^.]+$/.test(src);
              const isEthkwear = project.slug === 'ethkwear';
              return (
                <m.div
                  key={src}
                  className="overflow-hidden w-full"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.9, ease: EASE_OUT }}
                >
                  {vid ? (
                    <video src={src} className="w-full h-auto" autoPlay muted loop playsInline />
                  ) : isEthkwear && !isMobile ? (
                    <img
                      src={src}
                      alt={`${project.title} — ${String(i + 1).padStart(2, '0')}`}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={src}
                      alt={`${project.title} — ${String(i + 1).padStart(2, '0')}`}
                      className={`w-full object-cover ${i === 0 ? 'h-[65vh]' : i % 2 === 0 ? 'h-[50vh]' : 'h-[60vh]'}`}
                      loading="lazy"
                    />
                  )}
                </m.div>
              );
            })}
          </div>

        )}

        {/* Reflection */}
        <m.div
          className="px-8 md:px-16 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 border-t border-ink/8 mt-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          <div>
            <p className="font-montserrat text-[10px] tracking-[0.4em] uppercase text-ink/25 mb-6">Reflection</p>
            <h3 className="font-geologica font-semibold leading-tight text-ink" style={{ fontSize: 'clamp(18px, 2vw, 32px)' }}>
              What this project taught me.
            </h3>
          </div>
          <div className="flex items-start pt-2">
            <p className="font-montserrat text-[13px] leading-[1.9] text-ink/60">{project.reflection ?? project.description}</p>
          </div>
        </m.div>

        {/* Next project panel */}
        <div
          className="bg-blue overflow-hidden cursor-none"
          data-cursor-scroll
          style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          onClick={goToNext}
        >
          <div className="px-8 md:px-16 pt-12 flex items-center justify-between">
            <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-white/30">Up next — scroll or click</p>
            <div className="w-32 h-px bg-white/15 relative overflow-hidden">
              <m.div className="absolute inset-y-0 left-0 bg-white/60" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.1 }} />
            </div>
          </div>
          <div className="flex-1 flex items-center overflow-hidden my-8">
            <div className="marquee-track-slow">
              {Array(6).fill(null).map((_, i) => (
                <span key={i} className="font-geologica font-bold uppercase whitespace-nowrap text-cream/90 pr-20"
                  style={{ fontSize: 'clamp(80px, 14vw, 220px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
                  {nextProject.title}&nbsp;→&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-between border-t border-white/10 pt-6 px-8 md:px-16 pb-12">
            <p className="font-montserrat text-[11px] tracking-[0.2em] uppercase text-white/35">{nextProject.category}</p>
            <p className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-white/30">{nextProject.year}</p>
          </div>
        </div>

      </m.main>
    </div>
  );
}
