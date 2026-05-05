import type { Metadata } from 'next';

import Notifications from '@pages/Notifications/Notifications';

export const metadata: Metadata = {
  title: 'Notifications | Domilix',
  description: 'Consultez toutes vos notifications Domilix.',
};

export default function NotificationsPage() {
  return <Notifications />;
}
