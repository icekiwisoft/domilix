import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'react-international-phone/style.css';
import '../index.css';

import AppBootstrap from '@components/AppBootstrap/AppBootstrap';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Domilix',
  description: 'Plateforme Domilix',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang='fr'>
      <body>
        <AppBootstrap>{children}</AppBootstrap>
      </body>
    </html>
  );
}
