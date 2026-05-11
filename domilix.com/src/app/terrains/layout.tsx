import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Terrains à vendre et à louer au Cameroun',
  description:
    'Trouvez des terrains constructibles, agricoles ou commerciaux partout au Cameroun sur Domilix.',
  alternates: {
    canonical: '/terrains',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Terrains à vendre et à louer au Cameroun | Domilix',
    description:
      'Trouvez des terrains constructibles, agricoles ou commerciaux partout au Cameroun sur Domilix.',
    url: 'https://domilix.com/terrains',
    siteName: 'Domilix',
    locale: 'fr_CM',
    type: 'website',
    images: [{ url: '/favicon.png', width: 512, height: 512, alt: 'Domilix' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terrains à vendre et à louer au Cameroun | Domilix',
    description:
      'Trouvez des terrains constructibles, agricoles ou commerciaux partout au Cameroun sur Domilix.',
    images: ['/favicon.png'],
  },
};

export default function TerrainsLayout({ children }: { children: ReactNode }) {
  return children;
}
