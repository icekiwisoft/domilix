'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { signinDialogActions, signupDialogActions } from '@stores/defineStore';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/authApi';
import HoneypotInput from '@components/HoneypotInput/HoneypotInput';
import BlockInputs from '@components/OTP/BlockInputs';

const inputCls = 'w-full p-2.5 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition outline-none text-gray-800 text-sm';

export default function SigninDialog() {
  const router = useRouter();
  const { login, verifyPhone, resendVerificationCode, isLoading, user } = useAuth();

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [website, setWebsite] = useState('');
  const [resetEmailLoading, setResetEmailLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEmail = (value: string) => value.includes('@');
  const normalizeIdentifier = (value: string) => value.trim().replace(/[\s.-]/g, '');

  const encodePhone = (phone: string) =>
    phone.length < 4 ? phone : `${phone.slice(0, 3)}***${phone.slice(-2)}`;

  const getPhoneForVerification = () =>
    user?.phone_number || (!isEmail(identifier) ? identifier : '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!identifier) { setError('Veuillez saisir un email ou un numéro de téléphone'); return; }

    const norm = isEmail(identifier) ? identifier.trim() : normalizeIdentifier(identifier);
    const credentials = { password, ...(isEmail(norm) ? { email: norm } : { phone_number: norm }) };

    const result = await login(credentials);
    if (result.success) {
      setSuccess('Connexion réussie !');
      if (!isEmail(norm) && !result.data?.user?.phone_verified) {
        setIsVerifyingPhone(true);
      } else {
        signinDialogActions.toggle();
      }
    } else {
      setError(result.error || 'Erreur lors de la connexion');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const email = identifier.trim();
    if (!email || !isEmail(email)) { setError('Veuillez saisir une adresse email valide'); return; }
    try {
      setResetEmailLoading(true);
      await authApi.sendResetEmail(email, website);
      signinDialogActions.toggle();
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Impossible d'envoyer le lien de réinitialisation");
    } finally {
      setResetEmailLoading(false);
    }
  };

  const handleSubmitOTP = async (otp: string[]) => {
    const result = await verifyPhone(otp.join(''));
    if (result.success) {
      setSuccess('Téléphone vérifié avec succès !');
      setIsVerifyingPhone(false);
      signinDialogActions.toggle();
    } else {
      setError(result.error || 'Code de vérification incorrect');
    }
  };

  const handleResendCode = async () => {
    const result = await resendVerificationCode();
    if (result.success) setSuccess('Code renvoyé avec succès !');
    else setError(result.error || 'Erreur lors du renvoi du code');
  };

  const switchToSignup = () => {
    signinDialogActions.toggle();
    signupDialogActions.toggle();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4'
      onClick={signinDialogActions.toggle}
    >
      <div
        className='relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700'
          onClick={signinDialogActions.toggle}
          aria-label='Fermer'
        >
          <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        <div className='px-7 py-8'>
          {/* Alerts */}
          {error && <div className='mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</div>}
          {success && <div className='mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700'>{success}</div>}

          {/* ── OTP ── */}
          {isVerifyingPhone ? (
            <>
              <div className='mb-6'>
                <h2 className='text-2xl font-black text-gray-950'>Vérification du téléphone</h2>
                <p className='mt-1 text-sm text-gray-500'>
                  Code envoyé au <span className='font-semibold text-orange-500'>{encodePhone(getPhoneForVerification())}</span>
                </p>
              </div>
              <form onSubmit={e => e.preventDefault()} className='space-y-5'>
                <BlockInputs randomCode='' handleSubmit={handleSubmitOTP} />
                <button type='submit' disabled={isLoading} className='w-full rounded-xl bg-orange-500 py-2.5 text-sm font-black text-white transition hover:bg-orange-600 disabled:bg-gray-300'>
                  {isLoading ? 'Vérification...' : 'Vérifier'}
                </button>
                <p className='text-center text-sm text-gray-500'>
                  Pas reçu ?{' '}
                  <button type='button' onClick={handleResendCode} disabled={isLoading} className='font-semibold text-orange-500 hover:text-orange-600 disabled:text-gray-400'>
                    Renvoyer
                  </button>
                </p>
              </form>
            </>

          /* ── Mot de passe oublié ── */
          ) : isForgotPassword ? (
            <>
              <div className='mb-6'>
                <h2 className='text-2xl font-black text-gray-950'>Mot de passe oublié</h2>
                <p className='mt-1 text-sm text-gray-500'>Entrez votre email pour recevoir le lien de réinitialisation.</p>
              </div>
              <form onSubmit={handleForgotPassword} className='space-y-4'>
                <HoneypotInput value={website} onChange={setWebsite} />
                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Email</label>
                  <input type='email' value={identifier} onChange={e => setIdentifier(e.target.value)} required className={inputCls} placeholder='john@example.com' />
                </div>
                <button type='submit' disabled={resetEmailLoading} className='w-full rounded-xl bg-orange-500 py-2.5 text-sm font-black text-white transition hover:bg-orange-600 disabled:bg-gray-300'>
                  {resetEmailLoading ? 'Envoi...' : 'Recevoir le lien'}
                </button>
                <button type='button' onClick={() => { setIsForgotPassword(false); setError(''); }} className='w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50'>
                  Retour à la connexion
                </button>
              </form>
            </>

          /* ── Connexion ── */
          ) : (
            <>
              <div className='mb-6'>
                <h2 className='text-2xl font-black text-gray-950'>Se connecter</h2>
                <p className='mt-1 text-sm text-gray-500'>
                  Pas encore de compte ?{' '}
                  <button className='font-semibold text-orange-500 hover:text-orange-600' onClick={switchToSignup}>
                    S'inscrire
                  </button>
                </p>
              </div>

              <form onSubmit={handleLogin} className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Email ou téléphone</label>
                  <input type='text' value={identifier} onChange={e => setIdentifier(e.target.value)} required className={inputCls} placeholder='john@example.com ou 0612345678' />
                </div>

                <div className='relative'>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Mot de passe</label>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className={`${inputCls} pr-10`} placeholder='••••••••' />
                  <button type='button' onClick={() => setShowPassword(v => !v)} className='absolute right-3 top-9 text-gray-400 hover:text-orange-500' aria-label={showPassword ? 'Masquer' : 'Afficher'}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className='flex items-center justify-between'>
                  <label className='group flex cursor-pointer items-center gap-2'>
                    <input type='checkbox' checked={rememberMe} onChange={() => setRememberMe(v => !v)} className='peer sr-only' />
                    <span className='flex h-5 w-5 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition peer-checked:border-orange-500 peer-checked:bg-orange-500 group-hover:border-orange-300'>
                      <svg className='h-3 w-3 scale-0 text-white transition-transform peer-checked:scale-100' viewBox='0 0 20 20' fill='none'>
                        <path d='M5 10.5 8.2 14 15 6' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' />
                      </svg>
                    </span>
                    <span className='text-sm text-gray-600'>Se souvenir de moi</span>
                  </label>
                  <button type='button' onClick={() => { setIsForgotPassword(true); setError(''); setIdentifier(''); }} className='text-sm font-semibold text-orange-500 hover:text-orange-600'>
                    Mot de passe oublié ?
                  </button>
                </div>

                <button type='submit' disabled={isLoading} className='w-full rounded-xl bg-orange-500 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:bg-gray-300'>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
