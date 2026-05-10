import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Recherche de logements et meubles',
  description:
    'Recherchez des annonces Domilix par localisation, prix, type de bien et équipements.',
  alternates: {
    canonical: '/search',
  },
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return children;
}
