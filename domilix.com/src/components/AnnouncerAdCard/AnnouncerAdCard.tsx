'use client';

import { useState } from 'react';
import {
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

  const image = ad.medias?.[0]?.file ? mediaUrl(ad.medias[0].file) : defaultHouseImg.src;
  const locationLabel = ad.city
    ? `${ad.city}${ad.country ? `, ${ad.country}` : ''}`
    : ad.address || 'Adresse non spécifiée';

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
      <article className='group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
        <Link to={`/houses/${ad.id}`} target='_blank' className='block'>
          <div className='relative aspect-[4/3] overflow-hidden bg-gray-100'>
            <img
              src={image}
              alt={ad.description || 'Annonce'}
              loading='lazy'
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
            />
            <div className='absolute left-3 top-3 flex gap-2'>
              <span className='rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm backdrop-blur'>
                {ad.ad_type === 'location' ? 'Location' : 'Vente'}
              </span>
            </div>
          </div>
        </Link>

        {canManage && (
          <div className='absolute right-3 top-3 z-10'>
            <button
              type='button'
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                setMenuOpen(open => !open);
              }}
              className='flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-lg ring-1 ring-black/5 transition hover:bg-gray-900 hover:text-white'
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

        <div className='p-4'>
          <div className='mb-2 flex items-start justify-between gap-3'>
            <p className='line-clamp-1 text-xs font-semibold text-orange-600'>
              {ad.category?.name || 'Annonce'}
            </p>
            <p className='shrink-0 text-right text-sm font-black text-gray-900'>
              {formatPrice(ad.price)}{' '}
              <span className='text-xs font-semibold text-gray-500'>{ad.devise || 'FCFA'}</span>
            </p>
          </div>

          <Link to={`/houses/${ad.id}`} target='_blank'>
            <h3 className='mb-2 line-clamp-2 text-base font-black text-gray-900 transition-colors hover:text-orange-500'>
              {ad.description || 'Annonce immobilière'}
            </h3>
          </Link>

          <p className='mb-3 flex items-center gap-1 text-sm text-gray-500'>
            <MapPinIcon className='h-4 w-4 shrink-0' />
            <span className='line-clamp-1'>{locationLabel}</span>
          </p>

          <div className='flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500'>
            <span>{ad.creation_date ? new Date(ad.creation_date).toLocaleDateString() : 'Date inconnue'}</span>
            <span className='font-semibold text-gray-700'>#{ad.id}</span>
          </div>
        </div>
      </article>

      {editOpen && (
        <EditAdModal ad={ad} onClose={() => setEditOpen(false)} onUpdated={onUpdated} />
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
