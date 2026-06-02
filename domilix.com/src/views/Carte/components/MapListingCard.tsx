'use client';

import { mediaUrl } from '@utils/mediaUrl';

import { MapListing } from '../data/types';

interface MapListingCardProps {
  listing: MapListing;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  compact?: boolean;
}

const ADVERTISER_BADGES: Record<string, { label: string; color: string }> = {
  Propriétaire: { label: 'Propriétaire', color: 'border-orange-200 bg-orange-50 text-orange-700' },
  'Agent immobilier': { label: 'Agent', color: 'border-amber-200 bg-amber-50 text-amber-700' },
  Agence: { label: 'Agence', color: 'border-orange-300 bg-orange-100 text-orange-800' },
  Intermédiaire: { label: 'Intermédiaire', color: 'border-gray-200 bg-gray-50 text-gray-600' },
};

export default function MapListingCard({
  listing,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  compact,
}: MapListingCardProps) {
  const badge = ADVERTISER_BADGES[listing.advertiser_type] || ADVERTISER_BADGES.Intermédiaire;
  const imageSrc = mediaUrl(listing.thumbnail || listing.medias?.find((media) => media.thumbnail)?.thumbnail || listing.medias?.find((media) => media.file)?.file);

  return (
    <div
      onClick={onSelect}
      className={`group relative w-full cursor-pointer rounded-2xl border text-left transition-all duration-200 ${
        isSelected
          ? 'border-orange-300 bg-gradient-to-br from-orange-50 via-white to-white shadow-[0_10px_24px_rgba(232,146,26,0.20)] ring-2 ring-orange-400/25'
          : 'border-transparent bg-white hover:border-orange-100 hover:bg-orange-50/30 hover:shadow-sm'
      } ${compact ? 'p-3' : 'p-3'}`}
    >
      {isSelected && <span className="absolute left-0 top-4 h-10 w-1 rounded-r-full bg-[#E8921A]" />}
      <div className="flex gap-3">
        <div className={`${compact ? 'w-16 h-16' : 'w-20 h-20'} relative flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-gray-100 ring-1 ring-black/5`}>
          {imageSrc ? (
            <img src={imageSrc} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-orange-200">
              <svg className={`${compact ? 'w-6 h-6' : 'w-8 h-8'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
          {listing.is_verified && (
            <div className="absolute left-1.5 top-1.5 rounded-full bg-emerald-500 p-0.5 shadow-sm ring-2 ring-white">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h3 className={`${compact ? 'text-sm' : 'text-sm'} font-bold ${isSelected ? 'text-orange-950' : 'text-gray-900'} truncate`}>
                {listing.title}
              </h3>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {listing.neighbourhood}, {listing.city}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`-mr-1 -mt-1 flex-shrink-0 rounded-full p-1 transition hover:bg-orange-100 ${isFavorite ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
            >
              <svg
                className={`w-4 h-4 ${isFavorite ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`}
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm font-black text-[#E8921A]">
              {listing.price.toLocaleString()} FCFA
            </span>
            <span className="text-xs text-gray-400">
              /{listing.period === 'month' ? 'mois' : 'an'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${badge.color}`}>
              {badge.label}
            </span>
            {listing.item_type && (
              <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-bold text-gray-600">
                {listing.item_type}
              </span>
            )}
            {!listing.is_unlocked && (
              <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                Contact caché
              </span>
            )}
            {listing.is_unlocked && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Contact dispo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
