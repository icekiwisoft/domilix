'use client';

import { HeartIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + medias!.length) % medias!.length);
  }, [medias]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % medias!.length);
  }, [medias]);

  return (
    <article
      className='group relative overflow-hidden rounded-lg bg-surface-container-lowest shadow-card'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <div className='relative h-[220px] w-full overflow-hidden'>
        <Link to={`/houses/${id}`} className='block h-full'>
          <img
            alt={description || 'Annonce'}
            loading='lazy'
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
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
          className={`absolute right-sm top-sm flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 shadow-sm transition-colors ${
            liked ? 'text-primary-container' : 'text-secondary hover:text-primary-container'
          } ${isLiking ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <HeartIcon className={`size-[18px] ${liked ? 'fill-current' : ''}`} />
        </button>

        {/* Prev / Next buttons */}
        {hasMultipleImages && (
          <>
            <button
              type='button'
              onClick={handlePrev}
              aria-label='Image précédente'
              className='absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest/80 shadow-sm backdrop-blur-sm transition-opacity duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-surface-container-lowest'
            >
              <ChevronLeftIcon className='size-4 text-on-surface' />
            </button>
            <button
              type='button'
              onClick={handleNext}
              aria-label='Image suivante'
              className='absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest/80 shadow-sm backdrop-blur-sm transition-opacity duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-surface-container-lowest'
            >
              <ChevronRightIcon className='size-4 text-on-surface' />
            </button>
          </>
        )}

        {/* Status badge */}
        <div className='absolute bottom-sm left-sm rounded bg-surface-container-lowest/90 px-sm py-xs text-label-md text-on-surface shadow-sm backdrop-blur-sm'>
          {ad_type === 'location' ? 'À louer' : 'À vendre'}
        </div>

        {/* Image progress dots */}
        {hasMultipleImages && (
          <div className='absolute bottom-sm right-sm flex gap-1'>
            {medias.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-md'>
        {/* Price */}
        <Link to={`/houses/${id}`}>
          <h3 className='mb-xs text-headline-sm text-on-surface transition-colors hover:text-primary'>
            {formatPrice(price)}{' '}
            <span className='text-body-md font-normal text-on-surface-variant'>{currency}</span>
          </h3>
        </Link>

        {/* Title */}
        <p className='mb-xs truncate text-body-md text-on-surface'>
          {description || category?.name || 'Annonce'}
        </p>

        {/* Location */}
        <p className='mb-md flex items-center gap-xs text-caption text-secondary'>
          <MapPinIcon className='size-4 shrink-0' />
          <span className='truncate'>{locationLabel}</span>
        </p>

        {/* Features */}
        {hasAmenities && (
          <div className='flex flex-wrap items-center gap-md border-t border-outline-variant pt-sm'>
            {size ? (
              <div className='flex items-center gap-xs text-caption text-secondary'>
                <svg className='size-[15px] shrink-0' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                  <path d='M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z' />
                </svg>
                {size} m²
              </div>
            ) : null}
            {bedroom ? (
              <div className='flex items-center gap-xs text-caption text-secondary'>
                <svg className='size-[15px] shrink-0' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                  <path d='M2 20v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6' />
                  <path d='M2 14v-3a2 2 0 0 1 2-2h3' />
                  <path d='M17 9h3a2 2 0 0 1 2 2v3' />
                  <rect x='7' y='9' width='10' height='5' rx='1' />
                </svg>
                {bedroom} pce.
              </div>
            ) : null}
            {pool ? <span className='text-caption text-secondary'>Piscine</span> : null}
            {garage ? <span className='text-caption text-secondary'>Garage</span> : null}
            {garden ? <span className='text-caption text-secondary'>Jardin</span> : null}
          </div>
        )}
      </div>
    </article>
  );
}
