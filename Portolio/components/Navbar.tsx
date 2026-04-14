'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { flagFromNav } from '@/lib/navTransition';
import { EASE_OUT } from '@/lib/easing';
import { CONTACT } from '@/lib/constants';

/* ── Per-character stagger, triggered by prop ────────── */
function NavStaggerText({
  visibleText,
  hiddenText,
  trigger,
  className = '',
}: {
  visibleText: string;
  hiddenText: string;
  trigger: boolean;
  className?: string;
}) {
  const vis = visibleText.split('');
  const hid = hiddenText.split('');
  const D   = 0.072; // stagger delay per character (slow, majestic)

  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      {/* Current text → exits UP on trigger */}
      <span className="inline-block whitespace-nowrap">
        {vis.map((char, i) => (
          <motion.span
            key={`v${i}`}
            className="inline-block"
            initial={{ y: 0, opacity: 1 }}
            animate={trigger ? { y: '-110%', opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ delay: trigger ? i * D : 0, duration: trigger ? 0.55 : 0, ease: EASE_OUT }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
      {/* Destination text → enters from BOTTOM on trigger */}
      <span className="absolute left-0 top-0 inline-block whitespace-nowrap">
        {hid.map((char, i) => (
          <motion.span
            key={`h${i}`}
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={trigger ? { y: 0, opacity: 1 } : { y: '110%', opacity: 0 }}
            transition={{ delay: trigger ? i * D : 0, duration: trigger ? 0.55 : 0, ease: EASE_OUT }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

/* ── Page list ───────────────────────────────────────── */
const pages = [
  { label: 'Works',   href: '/'        },
  { label: 'About',   href: '/about'   },
  { label: 'Contact', href: '/contact' },
];

const spaPages = pages.filter(p => p.href !== '/contact');

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [pending,  setPending]  = useState<string | null>(null);
  const prevPathname = useRef(pathname);

  // Reset pending BEFORE the next paint once the route has actually changed.
  // Using useLayoutEffect avoids the one-frame flash where pending=null but
  // activeSpa is still the old page, which caused the old word to reappear.
  useLayoutEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setPending(null);
    }
  }, [pathname]);

  const isProjectPage = pathname.startsWith('/work/');
  const isArchivePage = pathname === '/archive';

  if (isArchivePage) return null;

  /* ── Project pages — small nav top-right ────────── */
  if (isProjectPage) {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 px-8 md:px-10 pt-4 flex items-start justify-end pointer-events-none overflow-visible">
        <div className="flex items-center gap-0 pointer-events-auto">
          {pages.map((page, i) => (
            <span key={page.href} className="flex items-center">
              {page.label === 'Contact' ? (
                <a
                  href={`mailto:${CONTACT.EMAIL}?subject=Let's work together`}
                  className="font-geologica font-bold text-ink/20 hover:text-ink transition-colors duration-300"
                  style={{ fontSize: 'clamp(13px, 1.05vw, 18px)' }}
                >
                  {page.label}
                </a>
              ) : (
                <Link
                  href={page.href}
                  className={`font-geologica font-bold transition-colors duration-300 ${
                    page.href === '/' ? 'text-ink' : 'text-ink/20 hover:text-ink'
                  }`}
                  style={{ fontSize: 'clamp(13px, 1.05vw, 18px)' }}
                >
                  {page.label}
                </Link>
              )}
              {i < pages.length - 1 && (
                <span
                  className="font-geologica font-bold text-ink/20 mx-[3px]"
                  style={{ fontSize: 'clamp(13px, 1.05vw, 18px)' }}
                >
                  ,
                </span>
              )}
            </span>
          ))}
        </div>
      </nav>
    );
  }

  /* ── Stagger-then-slide navigation ───────────────── */
  const handleNavClick = (href: string) => {
    if (href === pathname || pending !== null) return;
    setPending(href);

    // Let the stagger play (~72ms × 5 chars + 550ms = ~910ms for "Works,").
    // Navigate at 820ms — stagger ~90 % done, feels deliberate.
    setTimeout(() => {
      flagFromNav();        // template.tsx will enter from below
      router.push(href);   // pending reset handled by useLayoutEffect on pathname change
    }, 820);
  };

  /* ── Determine active + other SPA page ──────────── */
  const activeSpa = spaPages.find(p => p.href === pathname) ?? spaPages[0];
  const otherSpa  = spaPages.find(p => p.href !== pathname) ?? spaPages[1];
  const otherPages = pages.filter(p => p.href !== pathname);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-8 md:px-10 pt-2 flex items-start justify-between pointer-events-none overflow-visible">

      {/* Active — big, left */}
      <div className="pointer-events-auto">
        <Link
          href={activeSpa.href}
          className="font-geologica font-semibold leading-[0.85] text-ink block"
          style={{ fontSize: 'clamp(44px, 8vw, 132px)', letterSpacing: '-0.04em' }}
        >
          {/* key remounts on page change → trigger=false → shows new label static */}
          <NavStaggerText
            key={activeSpa.label}
            visibleText={`${activeSpa.label},`}
            hiddenText={`${otherSpa.label},`}
            trigger={pending !== null}
            className="leading-[1.05]"
          />
        </Link>
      </div>

      {/* Inactive — small, right */}
      <div className="flex items-center gap-0 pt-2 pointer-events-auto">
        {otherPages.map((page, i) => (
          <span key={page.href} className="flex items-center">
            {page.label === 'Contact' ? (
              <a
                href={`mailto:${CONTACT.EMAIL}?subject=Let's work together`}
                className="font-geologica font-bold text-ink/20 hover:text-ink transition-colors duration-300"
                style={{ fontSize: 'clamp(13px, 1.05vw, 18px)' }}
              >
                {page.label}
              </a>
            ) : (
              <Link
                href={page.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(page.href); }}
                className="font-geologica font-bold text-ink/20 hover:text-ink transition-colors duration-300 inline-flex items-center"
                style={{ fontSize: 'clamp(13px, 1.05vw, 18px)' }}
              >
                {/* key remounts on page change → no reverse animation */}
                <NavStaggerText
                  key={page.label}
                  visibleText={page.label}
                  hiddenText={activeSpa.label}
                  trigger={pending === page.href}
                />
              </Link>
            )}
            {i < otherPages.length - 1 && (
              <span
                className="font-geologica font-bold text-ink/20 mx-[3px]"
                style={{ fontSize: 'clamp(13px, 1.05vw, 18px)' }}
              >
                ,
              </span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
