import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Camille Breton',
  description:
    'Étudiant en Gestion de Projet Digital, à l\'intersection de l\'IA, du marketing et du design.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
