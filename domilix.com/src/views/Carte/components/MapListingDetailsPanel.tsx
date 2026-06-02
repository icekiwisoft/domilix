'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { mediaUrl } from '@utils/mediaUrl';

import { MapListing } from '../data/types';

interface MapListingDetailsPanelProps {
  listing: MapListing | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (listing: MapListing) => void;
  onUnlock: (listing: MapListing) => void;
  isUnlocking: boolean;
}

export default function MapListingDetailsPanel({
  listing,
  isFavorite,
  onClose,
  onToggleFavorite,
  onUnlock,
  isUnlocking,
}: MapListingDetailsPanelProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const gallery = useMemo(() => {
    if (!listing) return [];
    const mediaItems = (listing.medias || [])
      .map((media) => media.file || media.url || media.path || media.thumbnail)
      .filter((value): value is string => Boolean(value))
      .map((value) => mediaUrl(value))
      .filter((value): value is string => Boolean(value));
    const fallback = mediaUrl(listing.thumbnail);
    return mediaItems.length > 0 ? mediaItems : fallback ? [fallback] : [];
  }, [listing]);

  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [listing?.id]);

  if (!listing) return null;

  const imageSrc = gallery[currentMediaIndex] || null;

  return (
    <aside className="pointer-events-none absolute bottom-4 right-4 top-4 z-[900] hidden w-[380px] md:block">
      <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
        <div className="relative h-56 shrink-0 bg-gradient-to-br from-orange-50 to-gray-100">
          {imageSrc ? (
            <img src={imageSrc} alt={listing.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-orange-200">⌂</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-lg transition hover:bg-white"
            aria-label="Fermer le détail"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(listing)}
            className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-lg transition hover:bg-orange-50"
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <svg className={`h-5 w-5 ${isFavorite ? 'fill-[#E8921A] text-[#E8921A]' : 'text-gray-500'}`} viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-4 rounded-2xl bg-[#E8921A] px-4 py-2 text-white shadow-lg shadow-orange-900/20">
            <p className="text-lg font-black leading-none">{listing.price.toLocaleString()} FCFA</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/75">/{listing.period === 'month' ? 'mois' : 'an'}</p>
          </div>
        </div>

        {gallery.length > 1 && (
          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-gray-100 bg-white px-4 py-3">
            {gallery.map((media, index) => (
              <button
                key={`${media}-${index}`}
                type="button"
                onClick={() => setCurrentMediaIndex(index)}
                className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border transition ${currentMediaIndex === index ? 'border-[#E8921A] ring-2 ring-orange-200' : 'border-gray-100 opacity-80 hover:opacity-100'}`}
                aria-label={`Afficher le média ${index + 1}`}
              >
                <img src={media} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-orange-700">{listing.type === 'furniture' ? 'Mobilier' : 'Immobilier'}</span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-gray-600">{listing.ad_type === 'sale' ? 'Vente' : 'Location'}</span>
            {listing.is_verified && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">Vérifié</span>}
            {!listing.is_unlocked && <span className="rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-black text-orange-700">Contact caché</span>}
            {listing.is_unlocked && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">Débloquée</span>}
          </div>

          <h2 className="text-xl font-black leading-tight text-gray-950">{listing.title}</h2>
          <p className="mt-2 text-sm font-semibold text-gray-500">{listing.neighbourhood}{listing.neighbourhood && listing.city ? ', ' : ''}{listing.city}</p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-orange-50 p-3 text-center">
              <p className="text-lg font-black text-gray-950">{listing.bedrooms || '-'}</p>
              <p className="text-[10px] font-bold uppercase text-gray-400">Chambres</p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-center">
              <p className="text-lg font-black text-gray-950">{listing.bathrooms || '-'}</p>
              <p className="text-[10px] font-bold uppercase text-gray-400">SDB</p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-center">
              <p className="truncate text-lg font-black text-gray-950">{listing.devise || 'XOF'}</p>
              <p className="text-[10px] font-bold uppercase text-gray-400">Devise</p>
            </div>
          </div>

          {listing.description && (
            <div className="mt-5">
              <h3 className="text-sm font-black text-gray-950">Description</h3>
              <p className="mt-2 line-clamp-6 text-sm leading-6 text-gray-600">{listing.description}</p>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-gray-400">Annonceur</p>
            <p className="mt-1 text-sm font-black text-gray-900">{listing.advertiser_name || 'Annonceur Domilix'}</p>
          </div>

          {listing.is_unlocked && (listing.contact_phone || listing.contact_email) && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-black">Annonce débloquée</p>
              </div>
              {listing.contact_phone && (
                <a href={`tel:${listing.contact_phone}`} className="mt-3 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-black text-gray-900 shadow-sm transition hover:bg-emerald-50">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {listing.contact_phone}
                </a>
              )}
              {listing.contact_email && (
                <a href={`mailto:${listing.contact_email}`} className="mt-2 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-black text-gray-900 shadow-sm transition hover:bg-emerald-50">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {listing.contact_email}
                </a>
              )}
            </div>
          )}

          {!listing.is_unlocked && (
            <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <img src="/dom.png" alt="Domicoin" className="mt-0.5 h-8 w-8" />
                <div>
                  <p className="text-sm font-black text-orange-950">Débloquer le contact</p>
                  <p className="mt-1 text-xs leading-5 text-orange-800">Utilisez 1 Domicoin pour accéder aux coordonnées de cette annonce pendant 7 jours.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUnlock(listing)}
                disabled={isUnlocking}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8921A] px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUnlocking && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                Débloquer avec 1 Domicoin
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 p-4">
          <Link href={`/houses/${listing.id}`} className="flex w-full items-center justify-center rounded-2xl bg-[#E8921A] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">
            Voir l’annonce complète
          </Link>
        </div>
      </div>
    </aside>
  );
}
