import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { Ad } from '../../utils/types';
import ShareModal from '@components/ShareModal/ShareModal';
import { toggleLike } from '../../services/favoritesApi';
import { useAuth } from '../../hooks/useAuth';
import { signinDialogActions } from '@stores/defineStore';

export default function ProductCard(props: Ad): React.ReactElement {
  const {
    price,
    id,
    liked: initialLiked,
    description,
    medias,
    category,
    devise,
    period,
    ad_type,
  }: Ad = props;
  const [liked, setLike] = useState(initialLiked || false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasMultipleImages = medias && medias.length > 1;
  const priceLabel =
    typeof price === 'number'
      ? `${price.toLocaleString()} ${devise || 'FCFA'}${ad_type === 'location' ? `/${period || 'mois'}` : ''}`
      : 'Prix non specifie';
  const locationLabel = props.city || props.address || 'Adresse non specifiee';

  const handleLike = async () => {
    if (isLiking) return;

    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      signinDialogActions.toggle();
      return;
    }

    try {
      setIsLiking(true);
      const response = await toggleLike(id);
      setLike(response.liked);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Optionally show error message to user
    } finally {
      setIsLiking(false);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (medias && medias.length > 0) {
      setCurrentImageIndex(prev => (prev + 1) % medias.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (medias && medias.length > 0) {
      setCurrentImageIndex(prev => (prev - 1 + medias.length) % medias.length);
    }
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Autoplay functionality
  useEffect(() => {
    if (hasMultipleImages && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % medias.length);
      }, 3000); // Change image every 3 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hasMultipleImages, isHovered, medias?.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <div className='bg-white rounded-xl overflow-hidden'>
        {/* Section Image avec Carrousel */}
        <Link
          to={'/houses/' + id}
          target='_blank'
          className='block overflow-hidden rounded-2xl'
        >
          <div
            className='relative bg-gray-100 overflow-hidden group'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              alt='product'
              className='object-cover aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105'
              src={
                medias && medias.length > 0
                  ? 'http://localhost:8000' + medias[currentImageIndex].file
                  : `https://via.placeholder.com/400x300?text=Pas+d'image`
              }
            />

            {/* Navigation Carrousel */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className='absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm'
                >
                  <ChevronLeftIcon className='w-4 h-4' />
                </button>

                <button
                  onClick={nextImage}
                  className='absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm'
                >
                  <ChevronRightIcon className='w-4 h-4' />
                </button>

                <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1'>
                  {medias.map((_, index) => (
                    <button
                      key={index}
                      onClick={e => goToImage(index, e)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? 'bg-white'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>

                <div className='absolute top-3 right-3 text-white text-xs  rounded-full'>
                  <div className='flex items-center justify-between'>
                    <div className='flex gap-2'>
                      <button
                        onClick={e => {
                          e.preventDefault();
                          setShowShareModal(true);
                        }}
                        className='size-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors'
                        title='Partager'
                      >
                        <ShareIcon className='size-4' />
                      </button>

                      <button
                        onClick={e => {
                          e.preventDefault();
                          handleLike();
                        }}
                        disabled={isLiking}
                        className={`size-6 flex items-center justify-center rounded-full transition-colors ${
                          liked
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={
                          liked ? 'Retirer des favoris' : 'Ajouter aux favoris'
                        }
                      >
                        <HeartIcon
                          className={`size-4 ${liked ? 'fill-current' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Badge Type */}
            <div className='absolute top-3 left-3'>
              <span className='bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-full'>
                {ad_type === 'location' ? 'À louer' : 'À vendre'}
              </span>
            </div>
          </div>
        </Link>
        {/* Description, categorie et prix */}
        <Link to={'/houses/' + id} target='_blank' className='block'>
          <p className='mt-2 text-sm leading-5 text-gray-800'>
            <span>{description || 'Annonce'}</span>
            <span>{' . '}</span>
            <span>{category?.name || 'Non specifie'}</span>
            <span>{' . '}</span>
            <span>{locationLabel}</span>
            <span>{' . '}</span>
            <span className='font-semibold text-gray-900'>{priceLabel}</span>
          </p>
        </Link>

        {/* Actions */}
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`${window.location.origin}/houses/${id}`}
        title={category?.name || 'Annonce'}
        price={`${price?.toLocaleString()} ${devise || 'FCFA'}`}
        location={props.city || props.address}
        image={
          medias?.[0]?.file
            ? `http://localhost:8000${medias[0].file}`
            : undefined
        }
        type={ad_type === 'location' ? 'Location' : 'Vente'}
      />
    </>
  );
}
