'use client';

import Logo from '@assets/domilix.png';
import { Link } from '@router';

export default function FooterMinimal() {
  const logoSrc = typeof Logo === 'string' ? Logo : Logo.src;

  return (
    <footer className='bg-inverse-surface border-t border-outline-variant/20'>
      <div className='mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 py-12 md:flex-row md:gap-6 lg:px-10'>

        {/* Logo */}
        <Link to='/' className='flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity'>
          <img src={logoSrc} alt='Domilix' className='h-6 brightness-0 invert' />
        </Link>

        {/* Nav links */}
        <div className='flex flex-wrap items-center justify-center gap-x-6 gap-y-2'>
          <Link
            to='/about'
            className='text-sm text-surface-variant transition-colors hover:text-inverse-primary'
          >
            Qui sommes-nous
          </Link>
          <span className='text-outline/40 hidden md:inline'>·</span>
          <Link
            to='/privacy-policy'
            className='text-sm text-surface-variant transition-colors hover:text-inverse-primary'
          >
            Confidentialité
          </Link>
          <span className='text-outline/40 hidden md:inline'>·</span>
          <Link
            to='/cgu'
            className='text-sm text-surface-variant transition-colors hover:text-inverse-primary'
          >
            CGU
          </Link>
          <span className='text-outline/40 hidden md:inline'>·</span>
          <Link
            to='/mentions-legales'
            className='text-sm text-surface-variant transition-colors hover:text-inverse-primary'
          >
            Mentions légales
          </Link>
        </div>

        {/* Copyright */}
        <p className='text-sm text-inverse-on-surface/70 flex-shrink-0'>
          © {new Date().getFullYear()} Domilix. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
