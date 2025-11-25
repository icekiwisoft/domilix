import { useEffect, useState } from 'react';

export type ConsentStatus = 'accepted' | 'declined' | 'pending';

interface CookieConsentData {
  status: ConsentStatus;
  date: string | null;
}

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsentData>({
    status: 'pending',
    date: null,
  });

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookieConsent');
    const storedDate = localStorage.getItem('cookieConsentDate');

    if (storedConsent) {
      setConsent({
        status: storedConsent as ConsentStatus,
        date: storedDate,
      });
    }
  }, []);

  const hasConsent = (): boolean => {
    return consent.status === 'accepted';
  };

  const resetConsent = () => {
    localStorage.removeItem('cookieConsent');
    localStorage.removeItem('cookieConsentDate');
    setConsent({ status: 'pending', date: null });
  };

  return {
    consent,
    hasConsent,
    resetConsent,
  };
};
