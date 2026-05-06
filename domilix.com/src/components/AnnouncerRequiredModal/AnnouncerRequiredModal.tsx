'use client';

import { useNavigate } from '@router';

type AnnouncerRequiredModalProps = {
  onClose: () => void;
};

export default function AnnouncerRequiredModal({
  onClose,
}: AnnouncerRequiredModalProps) {
  const navigate = useNavigate();

  const handleGoToSettings = () => {
    onClose();
    navigate('/settings?tab=announcer');
  };

  return (
    <div className='fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500'>
          <svg
            viewBox='0 0 64 64'
            className='h-11 w-11'
            fill='none'
            aria-hidden='true'
          >
            <path
              d='M18 25.5 32 17l14 8.5v16.7L32 51 18 42.2V25.5Z'
              fill='#FFF4E5'
              stroke='currentColor'
              strokeWidth='3'
              strokeLinejoin='round'
            />
            <path
              d='M18.5 26 32 34.2 45.5 26M32 34v16'
              stroke='currentColor'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M24.5 21.5 38.3 30M39.5 13h8.5a3 3 0 0 1 3 3v8.5'
              stroke='currentColor'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M44 12.5c0 5.8 4.7 10.5 10.5 10.5'
              stroke='currentColor'
              strokeWidth='3'
              strokeLinecap='round'
            />
            <circle cx='47.5' cy='16.5' r='2' fill='currentColor' />
          </svg>
        </div>
        <p className='text-xs font-black uppercase tracking-[0.22em] text-orange-500'>
          Publication réservée
        </p>
        <h2 className='mt-2 text-2xl font-black text-slate-950'>
          Devenez annonceur
        </h2>
        <p className='mt-3 text-sm leading-6 text-slate-600'>
          Vous devez être annonceur pour pouvoir publier un colis sur Domilix.
        </p>

        <div className='mt-6 flex flex-col gap-2 sm:flex-row'>
          <button
            type='button'
            onClick={handleGoToSettings}
            className='h-11 flex-1 rounded-2xl bg-orange-500 text-sm font-black text-white transition hover:bg-orange-600'
          >
            Devenir annonceur
          </button>
          <button
            type='button'
            onClick={onClose}
            className='h-11 flex-1 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-50'
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
