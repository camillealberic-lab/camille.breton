import type { Metadata } from 'next';
import { Montserrat, Geologica } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import CustomCursor from '@/components/CustomCursor';
import Preloader from '@/components/Preloader';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import RouteGuard from '@/components/RouteGuard';


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

export const metadata: Metadata = {
  metadataBase: new URL('https://camillebreton.com'),
  title: 'Camille Breton — Portfolio',
  description:
    'Étudiant en Gestion de Projet Digital — branding, direction artistique & production augmentée par l\'IA.',
  openGraph: {
    title: 'Camille Breton — Portfolio',
    description: 'Branding, direction artistique & production augmentée par l\'IA.',
    type: 'website',
    images: [{ url: '/projects/shift/1.webp', width: 1200, height: 630, alt: 'Camille Breton Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Camille Breton — Portfolio',
    description: 'Branding, direction artistique & production augmentée par l\'IA.',
    images: ['/projects/shift/1.webp'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${geologica.variable}`}>
      <body className="bg-cream text-ink overflow-x-hidden">
        <RouteGuard />
        <Preloader />
        <CustomCursor />
        <SmoothScrollProvider>
          <Navbar />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
