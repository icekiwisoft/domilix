'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import FooterMinimal from '@components/FooterMinimal/FooterMinimal';
import HoneypotInput from '@components/HoneypotInput/HoneypotInput';
import Nav2 from '@components/Nav2/Nav2';
import { authApi } from '@services/authApi';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const resetToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    if (!resetToken) {
      setError('Lien de reinitialisation invalide ou incomplet. Demandez un nouveau lien.');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.resetPassword({
        email: email.trim(),
        token: resetToken,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(response.message || 'Mot de passe reinitialise avec succes.');
      setTimeout(() => router.push('/'), 1200);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Lien invalide ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Veuillez saisir une adresse email valide avant de renvoyer le lien.');
      return;
    }

    try {
      setLoading(true);
      await authApi.sendResetEmail(trimmedEmail, website);
      setSuccess('Un nouveau lien de reinitialisation a ete envoye a votre email.');
    } catch (error: any) {
      setError(error.response?.data?.message || "Impossible d'envoyer un nouveau lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav2 />
      <section className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-100 px-4 pb-24 pt-28 sm:pt-32'>
        <div className='mx-auto max-w-lg rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-xl shadow-orange-100/40 backdrop-blur'>
        <div className='mb-8 text-center'>
          <p className='text-xs font-bold uppercase tracking-[0.24em] text-orange-500'>
            Sécurité Domilix
          </p>
          <h1 className='mt-3 text-3xl font-black text-gray-950'>
            Réinitialiser le mot de passe
          </h1>
          <p className='mt-3 text-sm leading-6 text-gray-600'>
            Choisissez un nouveau mot de passe pour finaliser la reinitialisation.
          </p>
        </div>

        {error && (
          <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {error}
          </div>
        )}
        {success && (
          <div className='mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <HoneypotInput value={website} onChange={setWebsite} />
          <label className='block text-sm font-semibold text-gray-700'>
            Email
            <input
              type='email'
              value={email}
              onChange={event => setEmail(event.target.value)}
              className='mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
              placeholder='john@example.com'
              required
            />
          </label>

          <label className='block text-sm font-semibold text-gray-700'>
            Nouveau mot de passe
            <input
              type='password'
              value={password}
              onChange={event => setPassword(event.target.value)}
              className='mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
              placeholder='Au moins 8 caractères'
              required
            />
          </label>

          <label className='block text-sm font-semibold text-gray-700'>
            Confirmer le mot de passe
            <input
              type='password'
              value={passwordConfirmation}
              onChange={event => setPasswordConfirmation(event.target.value)}
              className='mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
              placeholder='Confirmez le mot de passe'
              required
            />
          </label>

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:bg-gray-400'
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>

          <button
            type='button'
            onClick={handleResendCode}
            disabled={loading}
            className='w-full rounded-xl border border-orange-200 px-4 py-3 text-sm font-bold text-orange-600 transition hover:bg-orange-50 disabled:text-gray-400'
          >
            Renvoyer le lien
          </button>
        </form>
        </div>
      </section>
      <FooterMinimal />
    </>
  );
}
