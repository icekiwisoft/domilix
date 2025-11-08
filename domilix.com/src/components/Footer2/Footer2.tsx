import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

export default function Footer2() {
  return (
    <footer className='bg-white border-t border-gray-200 py-6'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center space-y-4'>
          {/* Logo */}
          <h3 className='text-xl font-bold text-gray-900'>
            Domi<span className='text-orange-600'>lix</span>
          </h3>

          {/* Social Icons */}
          <div className='flex items-center space-x-3'>
            <a
              href='https://facebook.com'
              target='_blank'
              rel='noopener noreferrer'
              className='p-2 rounded-full bg-gray-100 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors'
            >
              <FaFacebook className='w-4 h-4' />
            </a>
            <a
              href='https://instagram.com'
              target='_blank'
              rel='noopener noreferrer'
              className='p-2 rounded-full bg-gray-100 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors'
            >
              <FaInstagram className='w-4 h-4' />
            </a>
            <a
              href='https://tiktok.com'
              target='_blank'
              rel='noopener noreferrer'
              className='p-2 rounded-full bg-gray-100 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors'
            >
              <SiTiktok className='w-4 h-4' />
            </a>
          </div>

          {/* Copyright */}
          <p className='text-gray-500 text-sm'>
            © {new Date().getFullYear()} Domilix. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
