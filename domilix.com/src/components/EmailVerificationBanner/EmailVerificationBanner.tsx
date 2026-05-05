'use client';

import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@hooks/useAuth';
import { authApi } from '@services/authApi';
import { setAuthUser } from '@stores/defineStore';

export default function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuth();
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const hasVerifiableEmail = !!user?.email && !user.email.endsWith('@domilix.local');
  const shouldShowBanner = isAuthenticated && user && !user.email_verified && hasVerifiableEmail;

  useEffect(() => {
    if (!shouldShowBanner || !bannerRef.current) {
      document.documentElement.style.removeProperty('--email-verification-banner-offset');
      return undefined;
    }

    const updateHeight = () => {
      const nextHeight = bannerRef.current?.offsetHeight || 0;
      setBannerHeight(nextHeight);
      document.documentElement.style.setProperty(
        '--email-verification-banner-offset',
        `${nextHeight}px`,
      );
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(bannerRef.current);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--email-verification-banner-offset');
    };
  }, [shouldShowBanner]);

  if (!shouldShowBanner) return null;

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.sendEmailVerification();
      setIsOpen(true);
      setMessage(
        response.verification_code
          ? `Code de test : ${response.verification_code}`
          : 'Code envoyé. Vérifiez votre boîte mail.',
      );
    } catch (error: any) {
      setError(error.response?.data?.message || "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Veuillez saisir le code reçu par email.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.verifyEmail(code.trim());
      setAuthUser(response.user);
      setMessage('Email vérifié avec succès.');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Code de vérification invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        ref={bannerRef}
        className='fixed left-0 right-0 top-16 z-40 border-b border-orange-200 bg-orange-50/95 px-4 py-2 shadow-sm backdrop-blur'
      >
        <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 text-sm lg:justify-between'>
          <p className='font-bold text-orange-900'>Votre email n'est pas vérifié.</p>
          <p className='text-orange-800'>
            Vérifiez votre email pour sécuriser votre compte Domilix.
          </p>
          {message && <p className='font-semibold text-green-700'>{message}</p>}
          {/* {error && <p className='font-semibold text-red-700'> Erreur lors de l'envoie du code </p>} */}

          <div className='flex flex-wrap items-center justify-center gap-2'>
            {isOpen && (
              <input
                value={code}
                onChange={event => setCode(event.target.value)}
                inputMode='numeric'
                placeholder='Code email'
                className='h-9 w-32 rounded-xl border border-orange-200 bg-white px-3 text-sm font-semibold text-gray-800 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
              />
            )}
            <button
              type='button'
              onClick={isOpen ? handleVerify : handleSendCode}
              disabled={loading}
              className='h-9 rounded-xl bg-orange-500 px-4 text-sm font-black text-white transition hover:bg-orange-600 disabled:bg-gray-400'
            >
              {loading
                ? 'Veuillez patienter...'
                : isOpen
                  ? 'Valider le code'
                  : 'Cliquer ici pour vérifier votre email'}
            </button>
            {isOpen && (
              <button
                type='button'
                onClick={handleSendCode}
                disabled={loading}
                className='h-9 rounded-xl border border-orange-200 bg-white px-4 text-sm font-bold text-orange-600 transition hover:bg-orange-100 disabled:text-gray-400'
              >
                Renvoyer
              </button>
            )}
          </div>
        </div>
      </div>
      <div style={{ height: bannerHeight }} aria-hidden='true' />
    </>
  );
}
