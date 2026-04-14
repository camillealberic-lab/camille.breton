import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Camille Breton',
  description:
    'Ouvert aux stages, projets de marque et collaborations créatives.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
