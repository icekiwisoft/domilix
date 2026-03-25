'use client';

import CookieConsent from '@components/CookieConsent/CookieConsent';
import SigninDialog from '@components/SigninDialog/SigninDialog';
import { useAuth } from '@hooks/useAuth';
import { useAuthStore, useUiStore } from '@stores/defineStore';
import React, { useEffect } from 'react';

export default function AppBootstrap({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null {
  const signinModal = useUiStore(state => state.signinModal);
  const authData = useAuthStore(state => state.authData);
  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const authChecked = useAuthStore(state => state.authChecked);
  const token = useAuthStore(state => state.token);
  const { authenticate, isLoading } = useAuth();

  useEffect(() => {
    if (!hasHydrated || authChecked) return;

    const initAuth = async () => {
      if (!token) {
        useAuthStore.getState().setAuthChecked(true);
        return;
      }

      await authenticate();
    };

    initAuth();
  }, [authenticate, authChecked, hasHydrated, token]);

  if (!hasHydrated || (authData?.status === 'unknow' && isLoading)) return null;

  return (
    <>
      {children}
      {signinModal && <SigninDialog />}
      <CookieConsent />
    </>
  );
}
