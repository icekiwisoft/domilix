'use client';

import { HeartIcon, MapPinIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@router';

import { Ad } from '../../utils/types';
import { toggleLike } from '../../services/favoritesApi';
import { useAuth } from '../../hooks/useAuth';
import { signinDialogActions } from '@stores/defineStore';
import { mediaUrl } from '@utils/mediaUrl';
import defaultHouseImg from '@assets/default-img/houses.jpg';

function formatPrice(price: number | undefined): string {
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
    ad_type,
    bedroom,
    pool,
    garage,
    garden,
    size,
  }: Ad = props;

  const [liked, setLike] = useState(initialLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();

  const hasMultipleImages = medias && medias.length > 1;
  const currency = devise ?? 'FCFA';
  const locationLabel = props.city
    ? `${props.city}${props.country ? `, ${props.country}` : ''}`
    : props.address || 'Adresse non spécifiée';
  const hasAmenities = !!size || !!bedroom || !!pool || !!garage || !!garden;

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
    } catch {
      // silent
    } finally {
      setIsLiking(false);
    }
  }, [id, isAuthenticated, isLiking]);

  const handleLikeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleLike();
    },
    [handleLike]
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <article
      className='group bg-surface-container-lowest rounded-lg overflow-hidden relative shadow-card'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <div className='relative h-[220px] w-full overflow-hidden'>
        <Link to={`/houses/${id}`} target='_blank' className='block h-full'>
          <img
            alt={description || 'Annonce'}
            loading='lazy'
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
            src={
              medias && medias.length > 0
                ? mediaUrl(medias[currentImageIndex].file)
                : defaultHouseImg.src
            }
          />
        </Link>

        {/* Favorite button */}
        <button
          type='button'
          onClick={handleLikeClick}
          disabled={isLiking}
          title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`absolute top-3 right-3 w-8 h-8 bg-surface-container-lowest/90 rounded-full flex items-center justify-center shadow-sm transition-colors ${
            liked ? 'text-primary-container' : 'text-secondary hover:text-primary-container'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <HeartIcon className={`size-[18px] ${liked ? 'fill-current' : ''}`} />
        </button>

        {/* Status badge */}
        <div className='absolute bottom-3 left-3 bg-surface-container-lowest/90 px-3 py-1 rounded text-xs font-semibold text-on-surface backdrop-blur-sm shadow-sm'>
          {ad_type === 'location' ? 'À louer' : 'À vendre'}
        </div>

        {/* Image progress dots */}
        {hasMultipleImages && (
          <div className='absolute bottom-3 right-3 flex gap-1'>
            {medias.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-6'>
        {/* Price */}
        <Link to={`/houses/${id}`} target='_blank'>
          <h3 className='text-2xl font-semibold text-on-surface leading-8 mb-1 hover:text-primary transition-colors'>
            {formatPrice(price)}{' '}
            <span className='text-sm font-medium text-on-surface-variant'>{currency}</span>
          </h3>
        </Link>

        {/* Title */}
        <p className='text-base text-on-surface mb-1 truncate'>
          {description || category?.name || 'Annonce'}
        </p>

        {/* Location */}
        <p className='text-xs text-secondary mb-6 flex items-center gap-1'>
          <MapPinIcon className='size-4 shrink-0' />
          <span className='truncate'>{locationLabel}</span>
        </p>

        {/* Features */}
        {hasAmenities && (
          <div className='flex items-center gap-4 flex-wrap border-t border-outline-variant pt-3 text-xs text-secondary'>
            {size ? (
              <span className='flex items-center gap-1'>
                <svg className='size-[15px] shrink-0' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                  <path d='M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z' />
                </svg>
                {size} m²
              </span>
            ) : null}
            {bedroom ? (
              <span className='flex items-center gap-1'>
                <svg className='size-[15px] shrink-0' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                  <path d='M2 20v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6' />
                  <path d='M2 14v-3a2 2 0 0 1 2-2h3' />
                  <path d='M17 9h3a2 2 0 0 1 2 2v3' />
                  <rect x='7' y='9' width='10' height='5' rx='1' />
                </svg>
                {bedroom} ch.
              </span>
            ) : null}
            {pool ? <span>Piscine</span> : null}
            {garage ? <span>Garage</span> : null}
            {garden ? <span>Jardin</span> : null}
          </div>
        )}
      </div>
    </article>
  );
}
