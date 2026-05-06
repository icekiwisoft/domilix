import React, { useEffect, useState } from 'react';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookieConsent');
    
    if (!consent) {
      // Petit délai avant d'afficher pour l'animation
      setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 10);
      }, 500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onAccept?.();
    }, 300);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDecline?.();
    }, 300);
  };

  const handleCustomize = () => {
    window.location.href = '/privacy-policy';
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[9998] bg-slate-950 transition-opacity duration-300 ${
          isAnimating ? 'opacity-35' : 'opacity-0'
        }`}
        onClick={handleDecline}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-[9999] px-3 pb-3 transition-all duration-500 ease-out sm:px-5 sm:pb-5 ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className='mx-auto max-w-5xl overflow-hidden rounded-[1.8rem] border border-orange-100 bg-white shadow-2xl ring-1 ring-black/5'>
          <div className='relative p-4 sm:p-5 md:p-6'>
            <div className='absolute -right-12 -top-16 h-36 w-36 rounded-full bg-orange-100 blur-2xl' />
            <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
              <div className='flex gap-4'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 sm:h-14 sm:w-14'>
                  <svg viewBox='0 0 64 64' className='h-9 w-9' fill='none' aria-hidden='true'>
                    <circle cx='32' cy='32' r='22' fill='#FFF4E5' stroke='currentColor' strokeWidth='3' />
                    <circle cx='25' cy='25' r='3' fill='currentColor' />
                    <circle cx='39' cy='28' r='2.5' fill='currentColor' />
                    <circle cx='32' cy='42' r='3' fill='currentColor' />
                    <path d='M45 42c-8 5-19 4-25-4' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
                  </svg>
                </div>

                <div className='min-w-0'>
                  <p className='text-xs font-black uppercase tracking-[0.22em] text-orange-500'>
                    Cookies
                  </p>
                  <h3 className='mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl'>
                    Nous respectons votre vie privée
                  </h3>
                  <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
                    Domilix utilise des cookies pour améliorer l’expérience, mesurer l’audience
                    et sécuriser la plateforme. Vous pouvez accepter ou refuser à tout moment.
                  </p>
                  <a
                    href='/privacy-policy'
                    className='mt-2 inline-flex text-sm font-bold text-orange-600 hover:text-orange-700'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Lire la politique de confidentialité
                  </a>
                </div>
              </div>

              <div className='relative flex flex-col gap-2 sm:flex-row md:flex-shrink-0 md:flex-col lg:flex-row'>
                <button
                  onClick={handleCustomize}
                  className='h-11 rounded-2xl border border-orange-100 bg-orange-50 px-5 text-sm font-black text-orange-700 transition hover:bg-orange-100'
                >
                  Politique
                </button>
                <button
                  onClick={handleDecline}
                  className='h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50'
                >
                  Refuser
                </button>
                <button
                  onClick={handleAccept}
                  className='h-11 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-orange-600'
                >
                  Accepter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
