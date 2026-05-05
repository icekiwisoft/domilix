import type { Metadata } from 'next';

import Settings from '@pages/Settings/Settings';

export const metadata: Metadata = {
  title: 'Paramètres | Domilix',
  description: 'Gérez votre profil, votre compte annonceur et vos packs Domilix.',
};

export default function SettingsPage() {
  return <Settings />;
}
