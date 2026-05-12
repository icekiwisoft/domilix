'use client';

import Logo from '@assets/domilix.png';
import { Link } from '@router';

export default function FooterMinimal() {
  const logoSrc = typeof Logo === 'string' ? Logo : Logo.src;

  return (
    <footer className='border-t border-outline-variant/40 bg-white'>
      <div className='mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row md:gap-6 lg:px-10'>

        {/* Logo */}
        <Link to='/' className='flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity'>
          <img src={logoSrc} alt='Domilix' className='h-6' />
        </Link>

        {/* Nav links */}
        <div className='flex flex-wrap items-center justify-center gap-x-6 gap-y-2'>
          <Link
            to='/about'
            className='text-sm text-on-surface-variant transition-colors hover:text-primary'
          >
            Qui sommes-nous
          </Link>
          <span className='hidden text-outline/60 md:inline'>·</span>
          <Link
            to='/privacy-policy'
            className='text-sm text-on-surface-variant transition-colors hover:text-primary'
          >
            Confidentialité
          </Link>
          <span className='hidden text-outline/60 md:inline'>·</span>
          <Link
            to='/cgu'
            className='text-sm text-on-surface-variant transition-colors hover:text-primary'
          >
            CGU
          </Link>
          <span className='hidden text-outline/60 md:inline'>·</span>
          <Link
            to='/mentions-legales'
            className='text-sm text-on-surface-variant transition-colors hover:text-primary'
          >
            Mentions légales
          </Link>
        </div>

        {/* Copyright */}
        <p className='flex-shrink-0 text-sm text-on-surface-variant'>
          © {new Date().getFullYear()} Domilix. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
