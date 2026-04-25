'use client';

import { HeartIcon, MapPinIcon, ShareIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@router';

import { Ad } from '../../utils/types';
import ShareModal from '@components/ShareModal/ShareModal';
import { toggleLike } from '../../services/favoritesApi';
import { useAuth } from '../../hooks/useAuth';
import { signinDialogActions } from '@stores/defineStore';
import { mediaUrl } from '@utils/mediaUrl';
import defaultHouseImg from '@assets/default-img/houses.jpg';

function formatPrice(price: number | undefined, devise: string | undefined): string {
  if (typeof price !== 'number') return '—';
  return price.toLocaleString();
}

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
    bedroom,
    pool,
    garage,
    garden,
  }: Ad = props;

  const [liked, setLike] = useState(initialLiked || false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();

  const hasMultipleImages = medias && medias.length > 1;
  const isVerified = props.announcer?.verified;
  const currency = devise ?? 'FCFA';
  const rentLabel =
    ad_type === 'location'
      ? `Location${period ? ` / ${period}` : ' mensuelle'}`
      : 'Prix de vente';
  const locationLabel = props.city
    ? `${props.city}${props.country ? `, ${props.country}` : ''}`
    : props.address || 'Adresse non spécifiée';
  const hasAmenities = !!bedroom || !!pool || !!garage || !!garden;

  useEffect(() => {
    if (!hasMultipleImages || isHovered) return;

    const timerId = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % medias.length);
    }, 3000);

    return () => clearInterval(timerId);
  }, [hasMultipleImages, isHovered, medias?.length]);

  const handleLike = useCallback(async () => {
    if (isLiking) return;

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
    } finally {
      setIsLiking(false);
    }
  }, [id, isAuthenticated, isLiking]);

  const handleShareClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareModal(true);
  }, []);

  const handleLikeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleLike();
    },
    [handleLike]
  );

  const nextImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (medias?.length) setCurrentImageIndex(prev => (prev + 1) % medias.length);
    },
    [medias?.length]
  );

  const prevImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (medias?.length)
        setCurrentImageIndex(prev => (prev - 1 + medias.length) % medias.length);
    },
    [medias?.length]
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleCloseShare = useCallback(() => setShowShareModal(false), []);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/houses/${id}`
      : `/houses/${id}`;

  return (
    <>
      <article className='group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300'>
        {/* ── Image ── */}
        <div
          className='relative aspect-[4/3] overflow-hidden'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link to={`/houses/${id}`} target='_blank' className='block h-full'>
            <img
              alt={description || 'Annonce'}
              loading='lazy'
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
              src={
                medias && medias.length > 0
                  ? mediaUrl(medias[currentImageIndex].file)
                  : defaultHouseImg.src
              }
            />
          </Link>

          {/* Badges haut-gauche */}
          <div className='absolute top-4 left-4 flex gap-2 pointer-events-none'>
            {isVerified && (
              <span className='bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded'>
                Vérifié
              </span>
            )}
            <span className='bg-white/90 text-gray-800 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded'>
              {ad_type === 'location' ? 'À louer' : 'À vendre'}
            </span>
          </div>

          {/* Actions haut-droit */}
          <div className='absolute top-4 right-4 flex gap-2'>
            <button
              type='button'
              onClick={handleShareClick}
              title='Partager'
              className='size-9 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-gray-700 rounded-full flex items-center justify-center transition-all'
            >
              <ShareIcon className='size-4' />
            </button>
            <button
              type='button'
              onClick={handleLikeClick}
              disabled={isLiking}
              title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={`size-9 backdrop-blur-md rounded-full flex items-center justify-center transition-all ${
                liked
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white hover:text-red-500'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <HeartIcon className={`size-4 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Navigation carrousel */}
          {hasMultipleImages && (
            <>
              <button
                type='button'
                onClick={prevImage}
                title='Image précédente'
                className='absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm'
              >
                <ChevronLeftIcon className='w-4 h-4' />
              </button>

              <button
                type='button'
                onClick={nextImage}
                title='Image suivante'
                className='absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm'
              >
                <ChevronRightIcon className='w-4 h-4' />
              </button>

              <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1'>
                {medias.map((_, index) => (
                  <button
                    key={index}
                    type='button'
                    title={`Image ${index + 1}`}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      index === currentImageIndex
                        ? 'bg-white'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Contenu ── */}
        <div className='p-4'>
          {/* Type + Prix */}
          <div className='flex justify-between items-start mb-2'>
            <p className='text-xs text-gray-500 pt-0.5'>
              {category?.name || (ad_type === 'location' ? 'Location' : 'Vente')}
            </p>
            <div className='text-right shrink-0 ml-3'>
              <p className='text-[10px] text-gray-400 leading-none mb-0.5'>{rentLabel}</p>
              <p className='text-lg font-bold text-gray-900 leading-tight'>
                {formatPrice(price, devise)}{' '}
                <span className='text-xs font-medium text-gray-500'>{currency}</span>
              </p>
            </div>
          </div>

          {/* Titre */}
          <Link to={`/houses/${id}`} target='_blank'>
            <h3 className='font-bold text-base text-gray-900 line-clamp-2 mb-2 hover:text-orange-500 transition-colors'>
              {description || 'Annonce'}
            </h3>
          </Link>

          {/* Localisation */}
          <p className='text-gray-500 text-sm mb-2 flex items-center gap-1'>
            <MapPinIcon className='size-3.5 shrink-0' />
            <span className='line-clamp-1'>{locationLabel}</span>
          </p>

          {/* Équipements en ligne */}
          {hasAmenities && (
            <p className='text-gray-500 text-xs mb-2 line-clamp-1'>
              {[
                bedroom ? `${bedroom} chambre${bedroom > 1 ? 's' : ''}` : null,
                pool ? 'Piscine' : null,
                garage ? 'Garage' : null,
                garden ? 'Jardin' : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}

          {/* Extrait */}
          {props.presentation && (
            <p className='text-xs text-gray-400 line-clamp-2 mt-2'>
              {props.presentation}
            </p>
          )}
        </div>
      </article>

      <ShareModal
        isOpen={showShareModal}
        onClose={handleCloseShare}
        url={shareUrl}
        title={description || category?.name || 'Annonce'}
        price={`${price?.toLocaleString()} ${currency}`}
        location={props.city || props.address}
        image={medias?.[0]?.file ? mediaUrl(medias[0].file) : undefined}
        type={ad_type === 'location' ? 'Location' : 'Vente'}
      />
    </>
  );
}
