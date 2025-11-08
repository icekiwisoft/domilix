import { login } from '@services/userApi';
import React, { FormEvent, useState } from 'react';

export default function Login(): React.ReactNode {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const loginSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(email, password, rememberMe);
  };

  return (
    <section className='bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center px-4'>
      <div className='max-w-md w-full mx-auto bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg space-y-6'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-1'>
            Bienvenue sur DOMILIX
          </h2>
          <p className='text-gray-600 text-sm'>
            Connectez-vous pour accéder à votre compte
          </p>
        </div>

        <form onSubmit={loginSubmit} className='space-y-4'>
          <div className='space-y-3'>
            <div className='relative'>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                Email
              </label>
              <input
                className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                type='email'
                placeholder='john.doe@example.com'
                value={email}
                onChange={e => setEmail(e.currentTarget.value)}
              />
            </div>

            <div className='relative'>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>
                Mot de passe
              </label>
              <input
                className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={e => setPassword(e.currentTarget.value)}
              />
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className='w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-200'
              />
              <span className='ml-2 text-sm text-gray-600'>Se souvenir de moi</span>
            </label>
            <a
              href='/forgot-password'
              className='text-sm text-orange-500 hover:text-orange-600 font-medium'
            >
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type='submit'
            className='w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm font-medium transition-all duration-200'
          >
            Connexion
          </button>

          <div className='text-center pt-2'>
            <span className='text-gray-600 text-sm'>
              Pas encore de compte ?{' '}
              <a
                className='text-orange-500 hover:text-orange-600 font-medium'
                href='/signup'
              >
                Inscrivez-vous
              </a>
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
