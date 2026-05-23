'use client';

import { useEffect } from 'react';

import Footer2 from '@components/Footer2/Footer2';
import Nav2 from '@components/Nav2/Nav2';
import SettingsPanel from '@components/SettingsPanel/SettingsPanel';
import { useNavigate, useSearchParams } from '@router';
import { useAuthStore } from '@stores/defineStore';

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authData = useAuthStore(state => state.authData);
  const authChecked = useAuthStore(state => state.authChecked);
  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const initialTab = searchParams.get('tab') === 'packs' ? 'subscriptions' : 'profile';

  useEffect(() => {
    if (!hasHydrated || !authChecked) return;
    if (authData.status !== 'logged') {
      navigate('/401', { replace: true });
    }
  }, [authChecked, authData.status, hasHydrated, navigate]);

  if (!hasHydrated || !authChecked || authData.status !== 'logged') {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-20'>
      <Nav2 />
      <SettingsPanel isOpen onClose={() => navigate('/')} variant='page' initialTab={initialTab} />
      <Footer2 />
    </div>
  );
}
