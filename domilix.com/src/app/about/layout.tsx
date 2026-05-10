import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'À propos de Domilix',
  description:
    'Découvrez Domilix, la plateforme qui facilite la recherche de logements et meubles au Cameroun.',
  alternates: {
    canonical: '/about',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'À propos de Domilix',
    description:
      'Découvrez Domilix, la plateforme qui facilite la recherche de logements et meubles au Cameroun.',
    url: 'https://domilix.com/about',
    siteName: 'Domilix',
    locale: 'fr_CM',
    type: 'website',
    images: [{ url: '/favicon.png', width: 512, height: 512, alt: 'Domilix' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'À propos de Domilix',
    description:
      'Découvrez Domilix, la plateforme qui facilite la recherche de logements et meubles au Cameroun.',
    images: ['/favicon.png'],
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
