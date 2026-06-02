'use client';

import { MapListing } from '../data/types';
import MapListingCard from './MapListingCard';

interface MapFavoritesProps {
  favorites: MapListing[];
  selectedListingId: number | null;
  onSelectListing: (id: number) => void;
  onToggleFavorite: (listing: MapListing) => void;
}

export default function MapFavorites({
  favorites,
  selectedListingId,
  onSelectListing,
  onToggleFavorite,
}: MapFavoritesProps) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p className="text-sm text-gray-400 font-medium">Aucun favori</p>
        <p className="text-xs text-gray-300 mt-1">Ajoutez des annonces à vos favoris en cliquant sur le cœur.</p>
      </div>
    );
  }

  return (
    <div className="px-3 pb-4 space-y-2">
      {favorites.map((listing) => (
        <MapListingCard
          key={listing.id}
          listing={listing}
          isSelected={selectedListingId === listing.id}
          isFavorite
          onSelect={() => onSelectListing(listing.id)}
          onToggleFavorite={() => onToggleFavorite(listing)}
        />
      ))}
    </div>
  );
}
