'use client';

import { useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';

import { useAuth } from '@hooks/useAuth';
import { authApi } from '@services/authApi';
import { setAuthUser } from '@stores/defineStore';
import { usePathname } from 'next/navigation';

const HIDDEN_PATHS = ['/about'];

export default function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const bannerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const hasVerifiableEmail = !!user?.email && !user.email.endsWith('@domilix.local');
  const shouldShowBanner =
    isAuthenticated &&
    user &&
    !user.email_verified &&
    hasVerifiableEmail &&
    !HIDDEN_PATHS.includes(pathname);

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

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [isModalOpen]);

  if (!shouldShowBanner) return null;

  const verificationCode = otp.join('');

  const updateOtp = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    if (value && index < nextOtp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedCode = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedCode) return;

    event.preventDefault();
    const nextOtp = Array(6).fill('');
    pastedCode.split('').forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);
    inputRefs.current[Math.min(pastedCode.length, 6) - 1]?.focus();
  };

  const handleOtpKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.sendEmailVerification();
      setIsModalOpen(true);
      setMessage(
        response.verification_code
          ? `Code de test : ${response.verification_code}`
          : 'Code envoyé. Vérifiez votre boîte mail.',
      );
    } catch {
      setError("Une erreur est survenue lors de l'envoi de l'email. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Veuillez saisir le code à 6 chiffres reçu par email.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.verifyEmail(verificationCode);
      setAuthUser(response.user);
      setMessage('Email vérifié avec succès.');
      setIsModalOpen(false);
      setOtp(Array(6).fill(''));
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
        className='fixed left-0 right-0 top-16 z-40 border-b-2 border-b-orange-500 bg-white px-3 py-1 shadow-sm sm:top-20 sm:px-4'
      >
        <div className='mx-auto flex min-h-10 max-w-7xl items-center justify-between gap-2 text-xs sm:text-sm'>
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <p className='mb-0 shrink-0 leading-none font-bold text-gray-900'>Email non vérifié.</p>
            <p className='mb-0 hidden truncate leading-none text-gray-600 sm:block'>
              Sécurisez votre compte Domilix.
            </p>
            {message && <p className='mb-0 truncate leading-none font-semibold text-green-600'>{message}</p>}
            {error && <p className='mb-0 truncate leading-none font-semibold text-red-600'>{error}</p>}
          </div>

          <button
            type='button'
            onClick={handleSendCode}
            disabled={loading}
            className='h-7 shrink-0 rounded-lg bg-green-500 px-3 text-xs font-black text-white transition hover:bg-green-600 disabled:opacity-50 sm:h-8 sm:px-4 sm:text-sm'
          >
            {loading ? '...' : 'Vérifier'}
          </button>
        </div>
      </div>
      <div style={{ height: bannerHeight }} aria-hidden='true' />

      {isModalOpen && (
        <div className='fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm'>
          <div className='w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-6'>
            <div className='mb-5 flex items-start justify-between gap-4'>
              <div>
                <p className='text-xs font-black uppercase tracking-[0.2em] text-orange-500'>
                  Vérification email
                </p>
                <h2 className='mt-2 text-2xl font-black text-gray-950'>Entrez le code</h2>
                <p className='mt-2 text-sm text-gray-600'>
                  Nous avons envoyé un code à 6 chiffres à {user.email}.
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='rounded-full bg-gray-100 px-3 py-1.5 text-lg font-bold text-gray-500 transition hover:bg-gray-200 hover:text-gray-900'
                aria-label='Fermer'
              >
                ×
              </button>
            </div>

            <div className='mb-4 flex justify-center gap-2 sm:gap-3'>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={input => {
                    inputRefs.current[index] = input;
                  }}
                  value={digit}
                  onChange={event => updateOtp(index, event.target.value)}
                  onKeyDown={event => handleOtpKeyDown(event, index)}
                  onPaste={handleOtpPaste}
                  inputMode='numeric'
                  maxLength={1}
                  className='h-12 w-11 rounded-2xl border border-orange-200 bg-orange-50 text-center text-xl font-black text-orange-600 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 sm:h-14 sm:w-12 sm:text-2xl'
                />
              ))}
            </div>

            {error && <p className='mb-3 text-center text-sm font-semibold text-red-600'>{error}</p>}
            {message && <p className='mb-3 text-center text-sm font-semibold text-green-700'>{message}</p>}

            <div className='flex flex-col gap-2 sm:flex-row'>
              <button
                type='button'
                onClick={handleVerify}
                disabled={loading}
                className='h-11 flex-1 rounded-2xl bg-orange-500 text-sm font-black text-white transition hover:bg-orange-600 disabled:bg-gray-400'
              >
                {loading ? 'Vérification...' : 'Valider le code'}
              </button>
              <button
                type='button'
                onClick={handleSendCode}
                disabled={loading}
                className='h-11 flex-1 rounded-2xl border border-orange-200 bg-white text-sm font-black text-orange-600 transition hover:bg-orange-50 disabled:text-gray-400'
              >
                Renvoyer le code
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
