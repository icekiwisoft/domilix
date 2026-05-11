import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Meubles et équipements au Cameroun',
  description:
    'Découvrez les annonces de meubles et équipements disponibles au Cameroun sur Domilix.',
  alternates: {
    canonical: '/furnitures',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Meubles et équipements au Cameroun | Domilix',
    description:
      'Découvrez les annonces de meubles et équipements disponibles au Cameroun sur Domilix.',
    url: 'https://domilix.com/furnitures',
    siteName: 'Domilix',
    locale: 'fr_CM',
    type: 'website',
    images: [{ url: '/favicon.png', width: 512, height: 512, alt: 'Domilix' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meubles et équipements au Cameroun | Domilix',
    description:
      'Découvrez les annonces de meubles et équipements disponibles au Cameroun sur Domilix.',
    images: ['/favicon.png'],
  },
};

export default function FurnituresLayout({ children }: { children: ReactNode }) {
  return children;
}
