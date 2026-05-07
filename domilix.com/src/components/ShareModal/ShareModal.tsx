import React, { useState } from 'react';
import { HiClipboard, HiCheck, HiXMark } from 'react-icons/hi2';
import { FaWhatsapp, FaFacebook, FaInstagram } from 'react-icons/fa';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
  price?: string;
  location?: string;
  image?: string;
  type?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  url,
  title,
  price,
  location,
  image,
  type,
}: ShareModalProps): React.ReactElement | null {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = encodeURIComponent(url || window.location.href);
  const shareTitle = encodeURIComponent(
    title || 'Découvrez cette annonce sur Domilix'
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm transition-opacity duration-300'
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className='fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2'>
        <div className='overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20'>
          <div className='flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4'>
            <div>
              <p className='text-xs font-black uppercase tracking-[0.18em] text-orange-500'>Partager</p>
              <h3 className='mt-1 text-lg font-black text-gray-950'>Envoyer cette annonce</h3>
            </div>
            <button
              onClick={onClose}
              className='rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900'
              aria-label='Fermer'
            >
              <HiXMark className='h-5 w-5' />
            </button>
          </div>

          {(image || title || price || location) && (
            <div className='px-5 pt-5'>
              <div className='flex gap-3'>
                {image && (
                  <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100'>
                    <img
                      src={image}
                      alt={title}
                      className='h-full w-full object-cover'
                    />
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  {type && (
                    <span className='mb-1.5 inline-block rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600'>
                      {type}
                    </span>
                  )}
                  {title && (
                    <h4 className='mb-1 truncate text-sm font-bold text-gray-950'>
                      {title}
                    </h4>
                  )}
                  {price && (
                    <p className='mb-0.5 text-sm font-black text-orange-600'>
                      {price}
                    </p>
                  )}
                  {location && (
                    <p className='flex items-center gap-1 truncate text-xs font-medium text-gray-500'>
                      <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                      {location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contenu */}
          <div className='p-5'>
            <div className='grid gap-2'>
              <a
                href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600'>
                  <FaWhatsapp className='h-5 w-5' />
                </div>
                <span className='text-sm font-bold text-gray-800'>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
                  <FaFacebook className='h-5 w-5' />
                </div>
                <span className='text-sm font-bold text-gray-800'>Facebook</span>
              </a>

              <a
                href={`https://www.instagram.com/share?url=${shareUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600'>
                  <FaInstagram className='h-5 w-5' />
                </div>
                <span className='text-sm font-bold text-gray-800'>Instagram</span>
              </a>
            </div>

            {/* Copier le lien */}
            <div className='relative mt-4'>
              <input
                type='text'
                value={url || window.location.href}
                readOnly
                className='w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-24 text-sm text-gray-500 outline-none'
              />
              <button
                onClick={handleCopyLink}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-black transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {copied ? (
                  <span className='flex items-center gap-1'>
                    <HiCheck className='w-4 h-4' />
                    Copié
                  </span>
                ) : (
                  <span className='flex items-center gap-1'>
                    <HiClipboard className='w-4 h-4' />
                    Copier
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
