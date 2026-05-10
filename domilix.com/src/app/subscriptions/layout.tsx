import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Packs Domilix pour débloquer les contacts',
  description:
    'Achetez un pack Domilix pour obtenir des Domicoins et débloquer les contacts des annonces qui vous intéressent.',
  alternates: {
    canonical: '/subscriptions',
  },
};

export default function SubscriptionsLayout({ children }: { children: ReactNode }) {
  return children;
}
