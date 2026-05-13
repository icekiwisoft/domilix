'use client';

import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';

const STORAGE_KEY = 'domilix-support-contact-popup-seen';

export default function SupportContactPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4' role='dialog' aria-modal='true' aria-labelledby='support-contact-title'>
      <div className='relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl'>
        <button
          type='button'
          onClick={() => setIsOpen(false)}
          className='absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800'
          aria-label='Fermer'
        >
          <HiXMark className='h-5 w-5' />
        </button>

        <h2 id='support-contact-title' className='pr-8 text-lg font-bold text-gray-950'>
          Contact Domilix
        </h2>

        <p className='mt-3 text-sm leading-6 text-gray-600'>
          Domilix est en développement actif. Pour tout souci, requête ou plainte, contactez-nous :
        </p>

        <div className='mt-5 space-y-2 text-sm text-gray-800'>
          <p>
            Téléphone :{' '}
            <a href='tel:+237698555511' className='font-semibold text-orange-600 hover:underline'>
              +237 698 555 511
            </a>
          </p>
          <p>
            Email :{' '}
            <a href='mailto:contact@domilix.com' className='font-semibold text-orange-600 hover:underline'>
              contact@domilix.com
            </a>
          </p>
        </div>

        <div className='mt-6 flex justify-end'>
          <button
            type='button'
            onClick={() => setIsOpen(false)}
            className='rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800'
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
