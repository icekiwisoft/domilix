import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Annonces immobilières au Cameroun',
  description:
    'Parcourez les annonces de chambres, studios, appartements et maisons disponibles au Cameroun sur Domilix.',
  alternates: {
    canonical: '/houses',
  },
  openGraph: {
    title: 'Annonces immobilières au Cameroun | Domilix',
    description:
      'Trouvez une chambre, un studio, un appartement ou une maison au Cameroun avec Domilix.',
    url: '/houses',
  },
};

export default function HousesLayout({ children }: { children: ReactNode }) {
  return children;
}
