import { MapsProvider } from '@context/MapsContext';

export default function MapsLayout({ children }: { children: React.ReactNode }) {
  return <MapsProvider>{children}</MapsProvider>;
}
