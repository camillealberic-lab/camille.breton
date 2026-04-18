import type { Metadata } from 'next';
import { Montserrat, Geologica } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import CustomCursor from '@/components/CustomCursor';
import Preloader from '@/components/Preloader';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import MotionProvider from '@/components/MotionProvider';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const geologica = Geologica({
  subsets: ['latin'],
  variable: '--font-geologica',
  display: 'swap',
  weight: ['500', '600', '700', '900'],
});

/* ── Shared meta — single source of truth for OpenGraph + Twitter ───────── */
const SITE_URL     = 'https://camillebreton.com';
const SITE_TITLE   = 'Camille Breton — Portfolio';
const SITE_DESC    = 'Étudiant en Gestion de Projet Digital — branding, direction artistique & production augmentée par l\'IA.';
const SOCIAL_DESC  = 'Branding, direction artistique & production augmentée par l\'IA.';
const SOCIAL_IMAGE = '/projects/shift/1.webp';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    title: SITE_TITLE,
    description: SOCIAL_DESC,
    type: 'website',
    images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: 'Camille Breton Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SOCIAL_DESC,
    images: [SOCIAL_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${geologica.variable}`}>
      <body className="bg-cream text-ink overflow-x-hidden">
        {/* MotionProvider = LazyMotion wrapper — enables tree-shaken `m.*` components */}
        <MotionProvider>
          <Preloader />
          <CustomCursor />
          <SmoothScrollProvider>
            <Navbar />
            {children}
          </SmoothScrollProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
