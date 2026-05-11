import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Annonces favorites',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoriteLayout({ children }: { children: ReactNode }) {
  return children;
}
