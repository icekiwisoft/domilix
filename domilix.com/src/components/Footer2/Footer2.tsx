import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { Link } from 'react-router-dom';

export default function Footer2() {
  return (
    <footer className='bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-6'>
          {/* Logo & Description */}
          <div className='md:col-span-1'>
            <h3 className='text-2xl font-bold text-gray-900 mb-2'>
              Domi<span className='text-orange-600'>lix</span>
            </h3>
            <p className='text-gray-600 text-sm'>
              Votre plateforme de confiance pour l'immobilier et le mobilier.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-3'>Navigation</h4>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  to='/houses'
                  className='text-gray-600 hover:text-orange-600 transition-colors'
                >
                  Immobiliers
                </Link>
              </li>
              <li>
                <Link
                  to='/furnitures'
                  className='text-gray-600 hover:text-orange-600 transition-colors'
                >
                  Mobiliers
                </Link>
              </li>
              <li>
                <Link
                  to='/subscriptions'
                  className='text-gray-600 hover:text-orange-600 transition-colors'
                >
                  Acheter
                </Link>
              </li>
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-3'>À propos</h4>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  to='/about'
                  className='text-gray-600 hover:text-orange-600 transition-colors'
                >
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <Link
                  to='/privacy-policy'
                  className='text-gray-600 hover:text-orange-600 transition-colors'
                >
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-3'>Suivez-nous</h4>
            <div className='flex items-center gap-2'>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='p-2.5 rounded-lg bg-white text-gray-600 hover:text-white hover:bg-orange-600 transition-all shadow-sm hover:shadow-md'
                aria-label='Facebook'
              >
                <FaFacebook className='w-5 h-5' />
              </a>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='p-2.5 rounded-lg bg-white text-gray-600 hover:text-white hover:bg-orange-600 transition-all shadow-sm hover:shadow-md'
                aria-label='Instagram'
              >
                <FaInstagram className='w-5 h-5' />
              </a>
              <a
                href='https://tiktok.com'
                target='_blank'
                rel='noopener noreferrer'
                className='p-2.5 rounded-lg bg-white text-gray-600 hover:text-white hover:bg-orange-600 transition-all shadow-sm hover:shadow-md'
                aria-label='TikTok'
              >
                <SiTiktok className='w-5 h-5' />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-6 border-t border-gray-200'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <p className='text-gray-500 text-sm'>
              © {new Date().getFullYear()} Domilix. Tous droits réservés.
            </p>
            <div className='flex items-center gap-4 text-sm'>
              <Link
                to='/cookie-settings'
                className='text-gray-500 hover:text-orange-600 transition-colors'
              >
                Paramètres des cookies
              </Link>
              <span className='text-gray-300'>•</span>
              <Link
                to='/privacy-policy'
                className='text-gray-500 hover:text-orange-600 transition-colors'
              >
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
