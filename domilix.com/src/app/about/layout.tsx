import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'À propos de Domilix',
  description:
    'Découvrez Domilix, la plateforme qui facilite la recherche de logements et meubles au Cameroun.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
