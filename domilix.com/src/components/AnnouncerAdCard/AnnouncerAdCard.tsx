'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@router';
import { deleteAd } from '@services/announceApi';
import { mediaUrl } from '@utils/mediaUrl';
import { Ad } from '@utils/types';

import defaultHouseImg from '@assets/default-img/houses.jpg';
import ConfirmDialog from '@components/ConfirmDialog/ConfirmDialog';
import EditAdModal from './EditAdModal';

interface AnnouncerAdCardProps {
  ad: Ad;
  canManage?: boolean;
  onDeleted?: (id: number) => void;
  onUpdated?: (ad: Ad) => void;
}

function formatPrice(price: number | undefined) {
  if (typeof price !== 'number') return '—';
  return price.toLocaleString();
}

export default function AnnouncerAdCard({
  ad,
  canManage = false,
  onDeleted,
  onUpdated,
}: AnnouncerAdCardProps): React.ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const hasMultipleImages = Boolean(ad.medias && ad.medias.length > 1);
  const currentMedia = ad.medias?.[currentImageIndex] || ad.medias?.[0];
  const image = currentMedia
    ? mediaUrl(currentMedia.thumbnail || currentMedia.file) ||
      defaultHouseImg.src
    : defaultHouseImg.src;
  const locationLabel =
    [ad.neighbourhood, ad.city, ad.country].filter(Boolean).join(', ') ||
    ad.address ||
    'Adresse non spécifiée';
  const hasAmenities =
    !!ad.size || !!ad.bedroom || !!ad.pool || !!ad.garage || !!ad.garden;

  useEffect(() => {
    if (!hasMultipleImages || isHovered || !ad.medias?.length) return;

    const timerId = window.setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % ad.medias!.length);
    }, 3000);

    return () => window.clearInterval(timerId);
  }, [ad.medias, hasMultipleImages, isHovered]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [ad.id]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMenuOpen(false);
  }, []);

  const handlePrev = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!ad.medias?.length) return;
      setCurrentImageIndex(
        prev => (prev - 1 + ad.medias!.length) % ad.medias!.length
      );
    },
    [ad.medias]
  );

  const handleNext = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!ad.medias?.length) return;
      setCurrentImageIndex(prev => (prev + 1) % ad.medias!.length);
    },
    [ad.medias]
  );

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(false);
    setEditOpen(true);
  };

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(false);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAd(ad.id);
      onDeleted?.(ad.id);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <>
      <article
        className='group relative overflow-hidden rounded-lg bg-surface-container-lowest shadow-card transition-shadow duration-300 hover:shadow-xl'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className='relative h-[220px] w-full overflow-hidden bg-gray-100'>
          <Link
            to={`/houses/${ad.id}`}
            target='_blank'
            className='block h-full'
          >
            <img
              src={image}
              alt={ad.description || 'Annonce'}
              loading='lazy'
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
            />
          </Link>

          {canManage && (
            <div className='absolute right-sm top-sm z-20'>
              <button
                type='button'
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  setMenuOpen(open => !open);
                }}
                className='flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 text-secondary shadow-sm backdrop-blur-sm transition-colors hover:bg-gray-900 hover:text-white'
                aria-label='Options annonce'
              >
                <EllipsisVerticalIcon className='h-5 w-5' />
              </button>

              {menuOpen && (
                <div className='absolute right-0 mt-2 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black/5'>
                  <button
                    type='button'
                    onClick={handleEdit}
                    className='flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  >
                    <PencilIcon className='h-4 w-4' />
                    Modifier
                  </button>
                  <button
                    type='button'
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className='flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50'
                  >
                    <TrashIcon className='h-4 w-4' />
                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              )}
            </div>
          )}

          {hasMultipleImages && (
            <>
              <button
                type='button'
                onClick={handlePrev}
                aria-label='Image précédente'
                className='pointer-events-none absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-lowest/80 opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:bg-surface-container-lowest group-hover:pointer-events-auto group-hover:opacity-100'
              >
                <ChevronLeftIcon className='size-4 text-on-surface' />
              </button>
              <button
                type='button'
                onClick={handleNext}
                aria-label='Image suivante'
                className='pointer-events-none absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-lowest/80 opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:bg-surface-container-lowest group-hover:pointer-events-auto group-hover:opacity-100'
              >
                <ChevronRightIcon className='size-4 text-on-surface' />
              </button>
            </>
          )}

          <div className='absolute bottom-sm left-sm rounded bg-surface-container-lowest/90 px-sm py-xs text-label-md text-on-surface shadow-sm backdrop-blur-sm'>
            {ad.ad_type === 'location' ? 'À louer' : 'À vendre'}
          </div>

          {hasMultipleImages && ad.medias && (
            <div className='absolute bottom-sm right-sm flex gap-1'>
              {ad.medias.map((media, index) => (
                <div
                  key={media.id || index}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className='p-md'>
          <Link to={`/houses/${ad.id}`} target='_blank'>
            <h3 className='mb-xs text-headline-sm text-on-surface transition-colors hover:text-primary'>
              {formatPrice(ad.price)}{' '}
              <span className='text-body-md font-normal text-on-surface-variant'>
                {ad.devise || 'FCFA'}
              </span>
            </h3>
          </Link>

          <p className='mb-xs truncate text-body-md text-on-surface'>
            {ad.description || ad.category?.name || 'Annonce immobilière'}
          </p>

          <p className='mb-md flex items-center gap-xs text-caption text-secondary'>
            <MapPinIcon className='size-4 shrink-0' />
            <span className='truncate'>{locationLabel}</span>
          </p>

          {hasAmenities ? (
            <div className='flex flex-wrap items-center gap-md border-t border-outline-variant pt-sm'>
              {ad.size ? (
                <div className='flex items-center gap-xs text-caption text-secondary'>
                  <svg
                    className='size-[15px] shrink-0'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    aria-hidden='true'
                  >
                    <path d='M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z' />
                  </svg>
                  {ad.size} m²
                </div>
              ) : null}
              {ad.bedroom ? (
                <div className='flex items-center gap-xs text-caption text-secondary'>
                  <svg
                    className='size-[15px] shrink-0'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    aria-hidden='true'
                  >
                    <path d='M2 20v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6' />
                    <path d='M2 14v-3a2 2 0 0 1 2-2h3' />
                    <path d='M17 9h3a2 2 0 0 1 2 2v3' />
                    <rect x='7' y='9' width='10' height='5' rx='1' />
                  </svg>
                  {ad.bedroom} pce.
                </div>
              ) : null}
              {ad.pool ? (
                <span className='text-caption text-secondary'>Piscine</span>
              ) : null}
              {ad.garage ? (
                <span className='text-caption text-secondary'>Garage</span>
              ) : null}
              {ad.garden ? (
                <span className='text-caption text-secondary'>Jardin</span>
              ) : null}
            </div>
          ) : (
            <div className='flex items-center justify-between border-t border-outline-variant pt-sm text-caption text-secondary'>
              <span>
                {ad.creation_date
                  ? new Date(ad.creation_date).toLocaleDateString()
                  : 'Date inconnue'}
              </span>
              <span className='font-semibold text-on-surface-variant'>
                #{ad.id}
              </span>
            </div>
          )}
        </div>
      </article>

      {editOpen && (
        <EditAdModal
          ad={ad}
          onClose={() => setEditOpen(false)}
          onUpdated={onUpdated}
        />
      )}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title='Supprimer cette annonce ?'
        description='Cette action retirera définitivement l’annonce de Domilix. Les visiteurs ne pourront plus la consulter.'
        confirmLabel='Supprimer'
        tone='danger'
        loading={isDeleting}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
