'use client';

import CookieConsent from '@components/CookieConsent/CookieConsent';
import EmailVerificationBanner from '@components/EmailVerificationBanner/EmailVerificationBanner';
import SigninDialog from '@components/SigninDialog/SigninDialog';
import SignupDialog from '@components/SignupDialog/SignupDialog';
import SiteTour from '@components/SiteTour/SiteTour';
import { useAuth } from '@hooks/useAuth';
import { useAuthStore, useUiStore } from '@stores/defineStore';
import React, { useEffect } from 'react';

export default function AppBootstrap({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null {
  const signinModal = useUiStore(state => state.signinModal);
  const signupModal = useUiStore(state => state.signupModal);
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
      <EmailVerificationBanner />
      {children}
      {signinModal && <SigninDialog />}
      {signupModal && <SignupDialog />}
      <CookieConsent />
      <SiteTour />
    </>
  );
}
