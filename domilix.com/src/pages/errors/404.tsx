import { Link } from 'react-router-dom';

import Nav from '../../components/Header/Nav/Nav';
import Nav2 from '@components/Nav2/Nav2';

export default function Error404() {
  return (
    <div className='min-h-screen bg-gradient-to-br '>
      <Nav2 />
      
      <div className='w-full flex items-center justify-center py-40 px-4'>
        <div className='max-w-6xl w-full'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-16'>
            {/* Contenu à gauche */}
            <div className='flex-1 text-center md:text-left space-y-6'>

              
              {/* Numéro 404 avec effet */}
              <div className='relative'>
                <div className='text-8xl md:text-9xl font-black text-orange-500 tracking-tight'>
                  404
                </div>
                <div className='absolute inset-0 text-8xl md:text-9xl font-black text-orange-200 blur-sm -z-10'>
                  404
                </div>
              </div>
              
              {/* Titre */}
              <h1 className='text-3xl md:text-4xl font-bold text-gray-900 leading-tight'>
                Page introuvable
              </h1>
              
              {/* Description */}
              <p className='text-lg text-gray-600 max-w-md mx-auto md:mx-0 leading-relaxed'>
                La page que vous recherchez n'existe pas ou a été déplacée. 
                Retournez à l'accueil pour continuer votre navigation.
              </p>

              {/* Boutons d'action */}
              <div className='flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start'>

                
                <Link to={'/houses'}>
                  <button className='px-8 py-3.5 text-base font-semibold text-orange-600 bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300'>
                    Voir les annonces
                  </button>
                </Link>
              </div>

              {/* Liens utiles avec icônes */}
              <div className='pt-8 flex flex-wrap gap-6 text-sm justify-center md:justify-start'>
                <Link to='/contact' className='group flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                  Contact
                </Link>
                <Link to='/houses' className='group flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                  </svg>
                  Annonces
                </Link>
                <Link to='/about' className='group flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  À propos
                </Link>
              </div>
            </div>

            {/* Image à droite avec effet */}
            <div className='flex-1 flex justify-center md:justify-end'>
              <div className='relative'>
                <img 
                  src='/404.png' 
                  alt='404 Error' 
                  className='w-80 h-80 md:w-[28rem] md:h-[28rem] object-contain drop-shadow-2xl'
                />
                {/* Cercle décoratif */}
                <div className='absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl -z-10 scale-75'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
