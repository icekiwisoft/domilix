'use client';

import { useState } from 'react';

import HoneypotInput from '@components/HoneypotInput/HoneypotInput';
import { authApi } from '@services/authApi';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.sendResetEmail(trimmedEmail, website);
      setSuccess(response.message || 'Si cet email existe, un lien de reinitialisation a ete envoye.');
    } catch (error: any) {
      setError(error.response?.data?.message || "Impossible d'envoyer le lien de reinitialisation.");
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
            Entrez votre email. Nous vous enverrons un lien pour reinitialiser votre mot de passe.
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

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:bg-gray-400'
          >
            {loading ? 'Envoi...' : 'Recevoir le lien'}
          </button>
        </form>
      </div>
    </section>
  );
}
