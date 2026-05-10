import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Meubles et équipements au Cameroun',
  description:
    'Découvrez les annonces de meubles et équipements disponibles au Cameroun sur Domilix.',
  alternates: {
    canonical: '/furnitures',
  },
};

export default function FurnituresLayout({ children }: { children: ReactNode }) {
  return children;
}
