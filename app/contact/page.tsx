'use client';

import { motion } from 'framer-motion';
import { EASE_OUT } from '@/lib/easing';
import { CONTACT } from '@/lib/constants';

export default function ContactPage() {
  return (
    <main className="bg-cream min-h-screen flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 pt-[clamp(80px,16vw,220px)] pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          <p className="font-montserrat text-[10px] tracking-[0.4em] uppercase text-ink/25 mb-8">
            Contact
          </p>

          <h1 className="font-geologica text-[6vw] font-bold uppercase leading-[0.9] text-ink mb-2 tracking-tight max-w-2xl">
            Let&apos;s work
          </h1>
          <h1 className="font-geologica text-[6vw] font-bold uppercase leading-[0.9] text-orange mb-16 tracking-tight">
            together.
          </h1>

          <p className="font-montserrat text-[13px] leading-[1.8] text-ink/60 max-w-md mb-14">
            Ouvert aux stages, projets de marque, collaborations créatives —
            et à tout ce qui se situe à l&apos;intersection du design et de la technologie.
          </p>

          {/* Email */}
          <div className="mb-10">
            <p className="font-montserrat text-[9px] tracking-[0.4em] uppercase text-ink/25 mb-3">
              Email
            </p>
            <motion.a
              href={`mailto:${CONTACT.EMAIL}`}
              className="font-geologica text-[2.5vw] font-semibold text-ink hover:text-orange transition-colors duration-300"
              whileHover={{ x: 8 }}
            >
              camille.breton@ynov.com
            </motion.a>
          </div>

          {/* Social links */}
          <div className="flex gap-8">
            <motion.a
              href={CONTACT.LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="font-montserrat text-[10px] tracking-[0.35em] uppercase text-ink/40 hover:text-ink border-b border-transparent hover:border-ink transition-all duration-300 pb-px"
              whileHover={{ y: -2 }}
            >
              LinkedIn
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Bottom strip */}
      <motion.div
        className="px-8 md:px-16 py-8 border-t border-ink/10 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <p className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-ink/20">
          Camille Breton — 2026
        </p>
        <p className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-ink/20">
          Digital Project Management — Bordeaux Ynov Campus
        </p>
      </motion.div>
    </main>
  );
}
