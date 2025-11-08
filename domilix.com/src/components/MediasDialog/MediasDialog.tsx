import { useState, useEffect, useCallback } from 'react';
import { Media } from '../../utils/types';

interface MediasDialogProps {
  toggleModal: () => void;
  medias: Media[];
  initialIndex?: number;
}

export default function MediasDialog({
  toggleModal,
  medias,
  initialIndex = 0,
}: MediasDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!medias || medias.length === 0) {
    return null;
  }

  const currentMedia = medias[currentIndex];

  const changeImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % medias.length);
  }, [medias.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + medias.length) % medias.length);
  }, [medias.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') toggleModal();
    },
    [nextImage, prevImage, toggleModal]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);
  return (
    <div
      className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4'
      onClick={toggleModal}
      role='dialog'
      aria-modal='true'
      aria-labelledby='gallery-title'
    >
      <div
        className='bg-white w-full max-w-7xl h-full max-h-[90vh] rounded-xl p-6 shadow-2xl relative flex flex-col'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between mb-6 flex-shrink-0'>
          <div>
            <h2 id='gallery-title' className='text-2xl font-bold text-gray-900'>
              Galerie photos
            </h2>
            <p className='text-gray-600 text-sm'>
              {currentIndex + 1} sur {medias.length} photo
              {medias.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            className='w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500'
            onClick={toggleModal}
            aria-label='Fermer la galerie'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
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

        <div className='flex flex-1 gap-6 min-h-0'>
          {/* Main image */}
          <div className='flex-1 relative bg-gray-100 rounded-lg overflow-hidden'>
            <img
              src={`http://localhost:8000${currentMedia.file}`}
              alt={`Photo ${currentIndex + 1} de ${medias.length}`}
              className='w-full h-full object-contain'
              loading='lazy'
            />

            {/* Navigation arrows */}
            {medias.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className='absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500'
                  aria-label='Image précédente'
                >
                  <svg
                    className='w-6 h-6 text-gray-700'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className='absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500'
                  aria-label='Image suivante'
                >
                  <svg
                    className='w-6 h-6 text-gray-700'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image counter */}
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium'>
              {currentIndex + 1} / {medias.length}
            </div>
          </div>

          {/* Thumbnails */}
          {medias.length > 1 && (
            <div className='w-64 flex-shrink-0'>
              <div className='h-full overflow-y-auto pr-2'>
                <div className='space-y-3'>
                  {medias.map((media, index) => (
                    <button
                      key={media.id}
                      className={`relative w-full cursor-pointer rounded-lg overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        index === currentIndex
                          ? 'ring-2 ring-orange-500 ring-offset-2'
                          : 'hover:opacity-80'
                      }`}
                      onClick={() => changeImage(index)}
                      aria-label={`Voir l'image ${index + 1}`}
                    >
                      <img
                        src={`http://localhost:8000${media.file}`}
                        alt={`Miniature ${index + 1}`}
                        className='w-full h-20 object-cover'
                        loading='lazy'
                      />
                      {index === currentIndex && (
                        <div className='absolute inset-0 bg-orange-500/20 flex items-center justify-center'>
                          <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with navigation dots */}
        {medias.length > 1 && medias.length <= 10 && (
          <div className='flex justify-center mt-4 space-x-2 flex-shrink-0'>
            {medias.map((_, index) => (
              <button
                key={index}
                onClick={() => changeImage(index)}
                className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-orange-500 focus:ring-offset-1 ${
                  index === currentIndex
                    ? 'bg-orange-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
