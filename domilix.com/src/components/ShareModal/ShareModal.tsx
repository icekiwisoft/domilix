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
        className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300'
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-md'>
        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
          {/* Header avec informations */}
          {(image || title || price || location) && (
            <div className='relative p-5 bg-gradient-to-br from-orange-50 to-white'>
              <button
                onClick={onClose}
                className='absolute top-3 right-3 p-1.5 hover:bg-white/80 rounded-full transition-colors'
              >
                <HiXMark className='w-5 h-5 text-gray-600' />
              </button>

              <div className='flex gap-3'>
                {image && (
                  <div className='w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm'>
                    <img
                      src={image}
                      alt={title}
                      className='w-full h-full object-cover'
                    />
                  </div>
                )}
                <div className='flex-1 min-w-0 pr-8'>
                  {type && (
                    <span className='inline-block px-2 py-0.5 text-xs font-medium text-orange-600 bg-white rounded-full mb-1.5'>
                      {type}
                    </span>
                  )}
                  {title && (
                    <h3 className='text-sm font-semibold text-gray-900 truncate mb-1'>
                      {title}
                    </h3>
                  )}
                  {price && (
                    <p className='text-base font-bold text-orange-600 mb-0.5'>
                      {price}
                    </p>
                  )}
                  {location && (
                    <p className='text-xs text-gray-600 truncate flex items-center gap-1'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
            <h3 className='text-base font-semibold text-gray-900 mb-4'>
              Partager sur
            </h3>

            {/* Boutons de partage en grille */}
            <div className='grid grid-cols-3 gap-3 mb-5'>
              <a
                href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group'
              >
                <div className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <FaWhatsapp className='w-6 h-6 text-white' />
                </div>
                <span className='text-xs font-medium text-gray-700'>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group'
              >
                <div className='w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <FaFacebook className='w-6 h-6 text-white' />
                </div>
                <span className='text-xs font-medium text-gray-700'>Facebook</span>
              </a>

              <a
                href={`https://www.instagram.com/share?url=${shareUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group'
              >
                <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <FaInstagram className='w-6 h-6 text-white' />
                </div>
                <span className='text-xs font-medium text-gray-700'>Instagram</span>
              </a>
            </div>

            {/* Copier le lien */}
            <div className='relative'>
              <input
                type='text'
                value={url || window.location.href}
                readOnly
                className='w-full px-4 py-3 pr-24 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-orange-300'
              />
              <button
                onClick={handleCopyLink}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
