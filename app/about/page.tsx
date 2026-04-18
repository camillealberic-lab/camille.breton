'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { m } from 'framer-motion';
import { EASE_OUT } from '@/lib/easing';
import { NAV_HEIGHT, CONTACT } from '@/lib/constants';
import {
  TextStaggerHover,
  TextStaggerHoverActive,
  TextStaggerHoverHidden,
} from '@/components/ui/text-stagger-hover';

type RevealState = 'hidden' | 'full';

export default function AboutPage() {
  const [reveal, setReveal] = useState<RevealState>('hidden');
  const [mounted, setMounted] = useState(false);
  const accumulated = useRef(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      accumulated.current += e.deltaY;
      if (accumulated.current > 380) setReveal('full');
      else if (accumulated.current < 80) setReveal('hidden');
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const deltaY = startY - e.touches[0].clientY;
      accumulated.current += deltaY;
      startY = e.touches[0].clientY;
      if (accumulated.current > 380) setReveal('full');
      else if (accumulated.current < 80) setReveal('hidden');
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const panelY = reveal === 'full' ? '0%' : '100%';

  return (
    <>
    <main
      className="fixed inset-0 bg-cream overflow-hidden"
      style={{ paddingTop: NAV_HEIGHT }}
    >
      {/* ── Main about content ───────────────────── */}
      <div className="absolute inset-0" style={{ paddingTop: NAV_HEIGHT }}>

        {/* 07 — desktop : bas gauche */}
        <m.span
          className="hidden md:block absolute left-6 font-geologica font-medium leading-none text-orange select-none"
          style={{
            fontSize: 'clamp(160px, 28vw, 420px)',
            lineHeight: 0.82,
            letterSpacing: '-0.03em',
            bottom: '7px',
          }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: EASE_OUT }}
        >
          07
        </m.span>

        {/* 07 — mobile : bas droite */}
        <m.span
          className="block md:hidden absolute right-4 font-geologica font-black leading-none text-orange select-none"
          style={{
            fontSize: 'clamp(96px, 22vw, 200px)',
            lineHeight: 0.82,
            letterSpacing: '-0.03em',
            bottom: '7px',
          }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: EASE_OUT }}
        >
          07
        </m.span>

        {/* Sidebar — pleine largeur mobile, 42% desktop */}
        <m.div
          className="absolute right-0 top-0 bottom-0 w-full md:w-[42%] flex flex-col gap-6 px-8 md:pr-14 md:pl-4 overflow-y-auto"
          style={{ paddingTop: 'clamp(48px, 14vh, 120px)', paddingBottom: 'clamp(32px, 6vh, 72px)' }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: EASE_OUT }}
        >
          {/* Biography */}
          <div className="mt-4 md:mt-0">
            <p className="font-montserrat text-[8px] tracking-[0.45em] uppercase text-ink/28 mb-3">
              Biographie
            </p>
            <p className="font-montserrat font-normal text-[13px] leading-[1.85] text-ink/60">
              J&apos;ai 19 ans — étudiant en première année de Gestion de Projet
              Digital, à l&apos;intersection de l&apos;IA, du marketing et du design.
              Là où d&apos;autres séparent ces disciplines, je les fais travailler
              ensemble : ChatGPT, Gemini et Claude pour accélérer la production
              et la veille stratégique ; Framer, Figma, Blender et CapCut pour
              construire des visuels où chaque détail a un sens. Branding,
              acquisition, CRM : j&apos;aborde le marketing avec une approche
              systémique et itérative, sans jamais sacrifier la qualité.
            </p>
          </div>

          {/* Competences */}
          <div>
            <p className="font-montserrat text-[8px] tracking-[0.45em] uppercase text-ink/28 mb-3">
              Compétences
            </p>
            <p className="font-montserrat font-normal text-[13px] leading-[1.9] text-ink/60">
              Branding & Identité Visuelle<br />
              Design UX/UI<br />
              Direction Artistique & Créative<br />
              Production Augmentée par l&apos;IA<br />
              Marketing Digital & CRM
            </p>
          </div>

          {/* Tools */}
          <div>
            <p className="font-montserrat text-[8px] tracking-[0.45em] uppercase text-ink/28 mb-3">
              Outils & Logiciels
            </p>
            <p className="font-montserrat font-normal text-[13px] leading-[1.9] text-ink/60">
              Figma, Framer, Blender, CapCut,<br />
              Photoshop, Illustrator,<br />
              Claude, ChatGPT, Gemini
            </p>
          </div>

          {/* Contact */}
          <div>
            <p className="font-montserrat text-[8px] tracking-[0.45em] uppercase text-ink/28 mb-3">
              Contact
            </p>
            <a
              href={`mailto:${CONTACT.EMAIL}`}
              className="font-montserrat font-normal text-[13px] text-ink/60 hover:text-ink transition-colors duration-300 relative inline-block"
            >
              <TextStaggerHover as="span">
                <TextStaggerHoverActive animation="top" className="opacity-100">
                  {CONTACT.EMAIL}
                </TextStaggerHoverActive>
                <TextStaggerHoverHidden animation="bottom" className="font-semibold">
                  {CONTACT.EMAIL}
                </TextStaggerHoverHidden>
              </TextStaggerHover>
            </a>
          </div>

          {/* Socials */}
          <div>
            <p className="font-montserrat text-[8px] tracking-[0.45em] uppercase text-ink/28 mb-3">
              Réseaux
            </p>
            <div className="flex flex-col gap-[3px]">
              <a
                href={CONTACT.LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="font-montserrat font-normal text-[13px] text-ink/60 hover:text-ink transition-colors duration-300 relative inline-block"
              >
                <TextStaggerHover as="span">
                  <TextStaggerHoverActive animation="top" className="opacity-100">
                    LinkedIn
                  </TextStaggerHoverActive>
                  <TextStaggerHoverHidden animation="bottom" className="font-semibold">
                    LinkedIn
                  </TextStaggerHoverHidden>
                </TextStaggerHover>
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="pb-4" />
        </m.div>

        {/* Bottom hint */}
      </div>
    </main>

      {/* ── Blue contact panel — portalled to body so z-[60] beats Navbar z-50 ── */}
      {mounted && createPortal(
      <m.div
        className="fixed inset-0 flex flex-col items-center justify-center z-[60]"
        style={{ backgroundColor: 'var(--blue)' }}
        initial={{ y: '100%' }}
        animate={{ y: panelY }}
        transition={{ duration: 0.75, ease: EASE_OUT }}
      >
        {/* Full content */}
        <m.div
          className="w-full px-10 md:px-16 flex flex-col items-start"
          animate={{ opacity: reveal === 'full' ? 1 : 0 }}
          transition={{ duration: 0.4, delay: reveal === 'full' ? 0.35 : 0 }}
        >
          <h1
            className="font-geologica font-semibold leading-[0.88] text-white tracking-tight"
            style={{ fontSize: 'clamp(72px, 13vw, 200px)', letterSpacing: '-0.04em' }}
          >
            Let&apos;s work
          </h1>
          <h1
            className="font-geologica font-semibold leading-[0.88] text-white/40 tracking-tight"
            style={{ fontSize: 'clamp(72px, 13vw, 200px)', letterSpacing: '-0.04em' }}
          >
            together.
          </h1>
          <a
            href={`mailto:${CONTACT.EMAIL}?subject=Let's work together`}
            className="mt-12 font-montserrat text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-300 relative inline-block"
          >
            <TextStaggerHover as="span">
              <TextStaggerHoverActive animation="top" className="opacity-100">
                Me contacter →
              </TextStaggerHoverActive>
              <TextStaggerHoverHidden animation="bottom" className="font-semibold">
                Me contacter →
              </TextStaggerHoverHidden>
            </TextStaggerHover>
          </a>
        </m.div>
      </m.div>,
      document.body
      )}
    </>
  );
}
