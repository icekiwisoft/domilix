import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'react-international-phone/style.css';
import '../index.css';

import AppBootstrap from '@components/AppBootstrap/AppBootstrap';
import type { Metadata } from 'next';
import React from 'react';

const siteUrl = 'https://domilix.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Domilix - Logements, chambres et meubles au Cameroun',
    template: '%s | Domilix',
  },
  description:
    'Trouvez rapidement un logement, une chambre, un appartement ou un meuble au Cameroun avec Domilix. Consultez des annonces vérifiées et contactez les annonceurs.',
  applicationName: 'Domilix',
  keywords: [
    'Domilix',
    'logement Cameroun',
    'location appartement Cameroun',
    'chambre à louer',
    'annonces immobilières Cameroun',
    'meubles Cameroun',
  ],
  authors: [{ name: 'Domilix' }],
  creator: 'Domilix',
  publisher: 'Domilix',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CM',
    url: siteUrl,
    siteName: 'Domilix',
    title: 'Domilix - Logements, chambres et meubles au Cameroun',
    description:
      'Trouvez rapidement un logement, une chambre, un appartement ou un meuble au Cameroun avec Domilix.',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'Domilix',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domilix - Logements, chambres et meubles au Cameroun',
    description:
      'Trouvez rapidement un logement, une chambre, un appartement ou un meuble au Cameroun avec Domilix.',
    images: ['/favicon.png'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Domilix',
  url: siteUrl,
  logo: `${siteUrl}/favicon.png`,
  description:
    'Plateforme camerounaise de recherche de logements, chambres, appartements et meubles.',
  areaServed: {
    '@type': 'Country',
    name: 'Cameroon',
  },
  sameAs: [siteUrl],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang='fr'>
      <body>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AppBootstrap>{children}</AppBootstrap>
      </body>
    </html>
  );
}
