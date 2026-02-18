import { Link } from 'react-router-dom';

export default function FooterMinimal() {
  return (
    <footer className='border-t border-gray-200 bg-white'>
      <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8'>
        <p>© {new Date().getFullYear()} Domilix. Tous droits reserves.</p>
        <div className='flex items-center gap-4'>
          <Link to='/about' className='transition-colors hover:text-orange-600'>
            Qui sommes nous
          </Link>
          <span className='text-gray-300'>|</span>
          <Link
            to='/privacy-policy'
            className='transition-colors hover:text-orange-600'
          >
            Confidentialite
          </Link>
          <span className='text-gray-300'>|</span>
          <Link
            to='/cookie-settings'
            className='transition-colors hover:text-orange-600'
          >
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
