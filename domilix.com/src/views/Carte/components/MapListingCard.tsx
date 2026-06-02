'use client';

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
  Propriétaire: { label: 'Propriétaire', color: 'bg-blue-100 text-blue-700' },
  'Agent immobilier': { label: 'Agent', color: 'bg-purple-100 text-purple-700' },
  Agence: { label: 'Agence', color: 'bg-amber-100 text-amber-700' },
  Intermédiaire: { label: 'Intermédiaire', color: 'bg-gray-100 text-gray-600' },
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

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl transition-all ${
        isSelected
          ? 'ring-2 ring-brand-500 shadow-md'
          : 'hover:shadow-sm'
      } ${compact ? 'p-3' : 'p-3'}`}
    >
      <div className="flex gap-3">
        <div className={`${compact ? 'w-16 h-16' : 'w-20 h-20'} rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative`}>
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className={`${compact ? 'w-6 h-6' : 'w-8 h-8'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {listing.is_verified && (
            <div className="absolute top-1 left-1 bg-emerald-500 rounded-full p-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h3 className={`${compact ? 'text-sm' : 'text-sm'} font-semibold text-gray-900 truncate`}>
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
              className="flex-shrink-0 p-1 -mr-1 -mt-1"
            >
              <svg
                className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
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
            <span className="text-sm font-bold text-brand-500">
              {listing.price.toLocaleString()} FCFA
            </span>
            <span className="text-xs text-gray-400">
              /{listing.period === 'month' ? 'mois' : 'an'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${badge.color}`}>
              {badge.label}
            </span>
            {listing.item_type && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                {listing.item_type}
              </span>
            )}
            {!listing.is_unlocked && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600">
                Contact caché
              </span>
            )}
            {listing.is_unlocked && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600">
                Contact dispo
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
