'use client';

import { useState } from 'react';
import { FaCheckCircle, FaEye, FaEyeSlash, FaFacebook, FaGoogle, FaTimesCircle } from 'react-icons/fa';

import BlockInputs from '@components/OTP/BlockInputs';
import { signupDialogActions, signinDialogActions } from '@stores/defineStore';
import { useAuth } from '../../hooks/useAuth';
import { RegisterData } from '../../services/authApi';

type RegistrationType = 'email' | 'phone';
type Step = 'method' | 'form';

const isProd = process.env.NODE_ENV === 'production';
const inputCls = 'w-full p-2.5 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition outline-none text-gray-800 text-sm';

export default function SignupDialog() {
  const { register, verifyPhone, resendVerificationCode, isLoading, user } = useAuth();

  const [step, setStep] = useState<Step>('method');
  const [registrationType, setRegistrationType] = useState<RegistrationType>('email');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const normalizeIdentifier = (value: string) => value.trim().replace(/[\s.-]/g, '');

  const encodePhone = (phone: string) =>
    phone.length < 4 ? phone : `${phone.slice(0, 3)}***${phone.slice(-2)}`;

  const getPhoneForVerification = () =>
    user?.phone_number || identifier;

  const handleSelectMethod = (type: RegistrationType) => {
    if (isProd && type === 'phone') return;
    setRegistrationType(type);
    setIdentifier('');
    setError('');
    setStep('form');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!identifier) {
      setError(registrationType === 'email' ? 'Veuillez saisir un email' : 'Veuillez saisir un numéro de téléphone');
      return;
    }
    if (!passwordsMatch) { setError('Les mots de passe ne correspondent pas'); return; }

    const norm = registrationType === 'phone' ? normalizeIdentifier(identifier) : identifier.trim();
    const registerData: RegisterData = {
      name: username,
      password,
      ...(registrationType === 'phone' ? { phone_number: norm } : { email: norm }),
    };

    const result = await register(registerData);
    if (result.success) {
      setSuccess('Inscription réussie !');
      if (registrationType === 'phone' && !result.data?.user?.phone_verified) {
        setIsVerifyingPhone(true);
      } else {
        signupDialogActions.toggle();
      }
    } else {
      setError(result.error || "Erreur lors de l'inscription");
    }
  };

  const handleSubmitOTP = async (otp: string[]) => {
    const result = await verifyPhone(otp.join(''));
    if (result.success) {
      setSuccess('Téléphone vérifié avec succès !');
      setIsVerifyingPhone(false);
      signupDialogActions.toggle();
    } else {
      setError(result.error || 'Code de vérification incorrect');
    }
  };

  const handleResendCode = async () => {
    const result = await resendVerificationCode();
    if (result.success) setSuccess('Code renvoyé avec succès !');
    else setError(result.error || 'Erreur lors du renvoi du code');
  };

  const switchToSignin = () => {
    signupDialogActions.toggle();
    signinDialogActions.toggle();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4'
      onClick={signupDialogActions.toggle}
    >
      <div
        className='relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700'
          onClick={signupDialogActions.toggle}
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

          /* ── Étape 1 : choix méthode ── */
          ) : step === 'method' ? (
            <>
              <div className='mb-7'>
                <h2 className='text-2xl font-black text-gray-950'>Créer un compte</h2>
                <p className='mt-1 text-sm text-gray-500'>
                  Déjà inscrit ?{' '}
                  <button className='font-semibold text-orange-500 hover:text-orange-600' onClick={switchToSignin}>
                    Se connecter
                  </button>
                </p>
              </div>

              {/* Réseaux sociaux */}
              <div className='grid grid-cols-2 gap-3'>
                <button type='button' disabled className='flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed'>
                  <FaGoogle className='h-4 w-4' />
                  Google
                  <span className='rounded-full bg-gray-200 px-1.5 py-0.5 text-[9px] font-black text-gray-500'>bientôt</span>
                </button>
                <button type='button' disabled className='flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed'>
                  <FaFacebook className='h-4 w-4' />
                  Facebook
                  <span className='rounded-full bg-gray-200 px-1.5 py-0.5 text-[9px] font-black text-gray-500'>bientôt</span>
                </button>
              </div>

              {/* Séparateur */}
              <div className='my-5 flex items-center gap-3'>
                <div className='h-px flex-1 bg-gray-200' />
                <span className='text-xs font-semibold text-gray-400'>ou continuer avec</span>
                <div className='h-px flex-1 bg-gray-200' />
              </div>

              {/* Email */}
              <button
                type='button'
                onClick={() => handleSelectMethod('email')}
                className='group mb-3 flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition hover:border-orange-300 hover:bg-orange-50'
              >
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white'>
                  <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </span>
                <div className='flex-1'>
                  <p className='text-sm font-black text-gray-900'>Adresse email</p>
                  <p className='text-xs text-gray-500'>Inscription avec votre email</p>
                </div>
                <svg className='h-4 w-4 text-gray-400 transition group-hover:text-orange-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
                </svg>
              </button>

              {/* Téléphone */}
              <button
                type='button'
                onClick={() => handleSelectMethod('phone')}
                disabled={isProd}
                className={`group flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition ${isProd ? 'cursor-default border-gray-100 bg-gray-50' : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'}`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${isProd ? 'bg-gray-100 text-gray-400' : 'bg-orange-100 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'}`}>
                  <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                  </svg>
                </span>
                <div className='flex-1'>
                  <p className={`text-sm font-black ${isProd ? 'text-gray-400' : 'text-gray-900'}`}>
                    Numéro de téléphone
                    {isProd && <span className='ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-500'>bientôt</span>}
                  </p>
                  <p className='text-xs text-gray-400'>Inscription avec votre numéro</p>
                </div>
                {!isProd && (
                  <svg className='h-4 w-4 text-gray-400 transition group-hover:text-orange-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
                  </svg>
                )}
              </button>
            </>

          /* ── Étape 2 : formulaire ── */
          ) : (
            <>
              <div className='mb-6 flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => { setStep('method'); setError(''); }}
                  className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100'
                  aria-label='Retour'
                >
                  <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
                <div>
                  <h2 className='text-xl font-black text-gray-950'>
                    {registrationType === 'email' ? 'Inscription par email' : 'Inscription par téléphone'}
                  </h2>
                  <p className='text-xs text-gray-400'>Étape 2 sur 2</p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className='mb-6 flex gap-1.5'>
                <div className='h-1 flex-1 rounded-full bg-orange-500' />
                <div className='h-1 flex-1 rounded-full bg-orange-500' />
              </div>

              <form onSubmit={handleRegister} className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Nom d'utilisateur</label>
                  <input type='text' value={username} onChange={e => setUsername(e.target.value)} required className={inputCls} placeholder='Votre prénom ou pseudo' />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>
                    {registrationType === 'email' ? 'Adresse email' : 'Numéro de téléphone'}
                  </label>
                  <input
                    type={registrationType === 'email' ? 'email' : 'text'}
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    className={inputCls}
                    placeholder={registrationType === 'email' ? 'john@example.com' : '0612345678'}
                  />
                </div>

                <div className='relative'>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Mot de passe</label>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className={`${inputCls} pr-10`} placeholder='••••••••' />
                  <button type='button' onClick={() => setShowPassword(v => !v)} className='absolute right-3 top-9 text-gray-400 hover:text-orange-500' aria-label={showPassword ? 'Masquer' : 'Afficher'}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className='relative'>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Confirmer le mot de passe</label>
                  <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={`${inputCls} pr-16`} placeholder='••••••••' />
                  <button type='button' onClick={() => setShowConfirmPassword(v => !v)} className='absolute right-9 top-9 text-gray-400 hover:text-orange-500' aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <div className='absolute right-3 top-9'>
                    {confirmPassword && (passwordsMatch
                      ? <FaCheckCircle className='text-green-500' />
                      : <FaTimesCircle className='text-red-500' />
                    )}
                  </div>
                </div>

                <button type='submit' disabled={isLoading} className='w-full rounded-xl bg-orange-500 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:bg-gray-300'>
                  {isLoading ? 'Création...' : 'Créer mon compte'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
