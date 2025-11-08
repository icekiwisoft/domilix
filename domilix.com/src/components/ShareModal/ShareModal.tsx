import { motion } from 'framer-motion';
import React from 'react';
import { HiClipboard } from 'react-icons/hi2';
import { FaWhatsapp, FaFacebook, FaInstagram } from 'react-icons/fa';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  url,
  title,
}: ShareModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  const shareUrl = encodeURIComponent(url || window.location.href);
  const shareTitle = encodeURIComponent(
    title || 'Découvrez cette annonce sur Domilix'
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url || window.location.href);
    // TODO: Ajouter une notification de succès
  };

  return (
    <>
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50'
        onClick={onClose}
      />
      <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md bg-white rounded-2xl shadow-xl p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-semibold text-gray-900'>
            Partager l'annonce
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='grid grid-cols-2 gap-4 mb-6'>
          <a
            href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-3 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors'
          >
            <FaWhatsapp className='w-5 h-5' />
            <span>WhatsApp</span>
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors'
          >
            <FaFacebook className='w-5 h-5' />
            <span>Facebook</span>
          </a>

          <a
            href={`https://www.instagram.com/share?url=${shareUrl}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-colors'
          >
            <FaInstagram className='w-5 h-5' />
            <span>Instagram</span>
          </a>

          <button
            onClick={handleCopyLink}
            className='flex items-center justify-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors'
          >
            <HiClipboard className='w-5 h-5' />
            <span>Copier le lien</span>
          </button>
        </div>

        <p className='text-sm text-gray-500 text-center'>
          Partagez cette annonce avec vos amis et votre famille
        </p>
      </div>
    </>
  );
}
