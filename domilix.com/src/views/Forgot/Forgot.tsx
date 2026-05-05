'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authApi } from '@services/authApi';

export default function Forgot() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    try {
      setLoading(true);
      await authApi.sendResetEmail(trimmedEmail);
      router.push(`/reset-password?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (error: any) {
      setError(error.response?.data?.message || "Impossible d'envoyer le code de reinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-100 px-4 py-24'>
      <div className='mx-auto max-w-md rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-xl shadow-orange-100/40 backdrop-blur'>
        <div className='mb-8 text-center'>
          <p className='text-xs font-bold uppercase tracking-[0.24em] text-orange-500'>
            Domilix
          </p>
          <h1 className='mt-3 text-3xl font-black text-gray-950'>
            Mot de passe oublié
          </h1>
          <p className='mt-3 text-sm leading-6 text-gray-600'>
            Entrez votre email. Nous vous enverrons un code pour reinitialiser votre mot de passe.
          </p>
        </div>

        {error && (
          <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
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

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:bg-gray-400'
          >
            {loading ? 'Envoi...' : 'Recevoir le code'}
          </button>
        </form>
      </div>
    </section>
  );
}
