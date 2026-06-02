'use client';

import { useEffect, useRef, useState } from 'react';
import { MapListing, MapFiltersState } from '../data/types';
import MapSearchBar from './MapSearchBar';
import MapListingCard from './MapListingCard';
import MapFilters from './MapFilters';
import MapFavorites from './MapFavorites';
import MapProPanel from './MapProPanel';

interface MapBottomSheetProps {
  listings: MapListing[];
  favorites: MapListing[];
  activeTab: 'listings' | 'favorites' | 'filters' | 'pro';
  onTabChange: (tab: 'listings' | 'favorites' | 'filters' | 'pro') => void;
  selectedListingId: number | null;
  onSelectListing: (id: number) => void;
  onToggleFavorite: (listing: MapListing) => void;
  isFavorite: (id: number) => boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: MapFiltersState;
  onFiltersChange: (filters: MapFiltersState) => void;
  cities: string[];
  totalCount: number;
}

const TABS = [
  { key: 'listings' as const, label: 'Annonces' },
  { key: 'favorites' as const, label: 'Favoris' },
  { key: 'filters' as const, label: 'Filtres' },
  { key: 'pro' as const, label: 'Pro' },
];

export default function MapBottomSheet({
  listings,
  favorites,
  activeTab,
  onTabChange,
  selectedListingId,
  onSelectListing,
  onToggleFavorite,
  isFavorite,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  cities,
}: MapBottomSheetProps) {
  const SHEET_HEIGHTS = {
    collapsed: 64,
    peek: 180,
    half: '50vh',
    full: '85vh',
  };

  const [sheetHeight, setSheetHeight] = useState<number | string>(SHEET_HEIGHTS.peek);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = startY - e.touches[0].clientY;
    const currentHeight = typeof sheetHeight === 'number' ? sheetHeight : window.innerHeight * 0.5;
    const newHeight = Math.max(64, Math.min(window.innerHeight * 0.85, currentHeight + deltaY));
    setSheetHeight(newHeight);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const h = typeof sheetHeight === 'number' ? sheetHeight : window.innerHeight * 0.5;
    if (h < 120) setSheetHeight(SHEET_HEIGHTS.peek);
    else if (h < window.innerHeight * 0.35) setSheetHeight(SHEET_HEIGHTS.peek);
    else setSheetHeight(SHEET_HEIGHTS.full);
  };

  return (
    <div
      ref={sheetRef}
      className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex flex-col transition-[height] duration-300 ease-out"
      style={{ height: sheetHeight, touchAction: 'none' }}
    >
      <div
        className="flex-shrink-0 px-4 pt-2 pb-1 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
        <MapSearchBar value={searchQuery} onChange={onSearchChange} />
      </div>

      <div className="flex-shrink-0 flex border-b border-gray-100 px-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 py-2 text-xs font-semibold transition relative ${
              activeTab === tab.key
                ? 'text-brand-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label === 'Favoris' ? `${tab.label} (${favorites.length})` : tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="py-1.5 text-xs text-gray-400">
          {activeTab === 'listings' && `${listings.length} annonce${listings.length > 1 ? 's' : ''}`}
          {activeTab === 'favorites' && `${favorites.length} favori${favorites.length > 1 ? 's' : ''}`}
        </div>

        {activeTab === 'listings' && (
          <div className="space-y-2 pb-4">
            {listings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucune annonce trouvée</p>
            ) : (
              listings.map((listing) => (
                <MapListingCard
                  key={listing.id}
                  listing={listing}
                  isSelected={selectedListingId === listing.id}
                  isFavorite={isFavorite(listing.id)}
                  onSelect={() => onSelectListing(listing.id)}
                  onToggleFavorite={() => onToggleFavorite(listing)}
                  compact
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <MapFavorites
            favorites={favorites}
            selectedListingId={selectedListingId}
            onSelectListing={onSelectListing}
            onToggleFavorite={onToggleFavorite}
          />
        )}

        {activeTab === 'filters' && (
          <MapFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            cities={cities}
          />
        )}

        {activeTab === 'pro' && <MapProPanel />}
      </div>
    </div>
  );
}
