import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Paramètres du compte',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
