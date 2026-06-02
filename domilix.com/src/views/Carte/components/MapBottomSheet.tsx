'use client';

import { useEffect, useRef, useState } from 'react';
import { MapListing, MapFiltersState, MapTab, DirectionPoint } from '../data/types';
import MapSearchBar from './MapSearchBar';
import MapListingCard from './MapListingCard';
import MapFilters from './MapFilters';
import MapFavorites from './MapFavorites';
import MapProPanel from './MapProPanel';
import MapDirectionsPanel from './MapDirectionsPanel';

interface MapBottomSheetProps {
  listings: MapListing[];
  favorites: MapListing[];
  unlockedListings: MapListing[];
  activeTab: MapTab;
  onTabChange: (tab: MapTab) => void;
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
  directionFrom: DirectionPoint | null;
  directionTo: DirectionPoint | null;
  onSetDirectionFrom: (pt: DirectionPoint) => void;
  onSetDirectionTo: (pt: DirectionPoint) => void;
  onClearDirectionFrom: () => void;
  onClearDirectionTo: () => void;
  onClearDirections: () => void;
}

const TABS = [
  { key: 'listings' as const, label: 'Annonces' },
  { key: 'favorites' as const, label: 'Favoris' },
  { key: 'unlocked' as const, label: 'Débloquées' },
  { key: 'directions' as const, label: 'Direction' },
  { key: 'filters' as const, label: 'Filtres' },
  { key: 'pro' as const, label: 'Pro' },
];

export default function MapBottomSheet({
  listings,
  favorites,
  unlockedListings,
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
  directionFrom,
  directionTo,
  onSetDirectionFrom,
  onSetDirectionTo,
  onClearDirectionFrom,
  onClearDirectionTo,
  onClearDirections,
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

      <div className="flex-shrink-0 flex gap-1 overflow-x-auto border-b border-gray-100 px-2 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`relative shrink-0 whitespace-nowrap px-3 py-2 text-xs font-semibold transition ${
              activeTab === tab.key
                ? 'text-brand-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.key === 'favorites' && `${tab.label} (${favorites.length})`}
            {tab.key === 'unlocked' && `${tab.label} (${unlockedListings.length})`}
            {tab.key !== 'favorites' && tab.key !== 'unlocked' && tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 mx-3 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="py-1.5 text-xs text-gray-400">
          {activeTab === 'listings' && `${listings.length} annonce${listings.length > 1 ? 's' : ''}`}
          {activeTab === 'favorites' && `${favorites.length} favori${favorites.length > 1 ? 's' : ''}`}
          {activeTab === 'unlocked' && `${unlockedListings.length} débloquée${unlockedListings.length > 1 ? 's' : ''}`}
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

        {activeTab === 'unlocked' && (
          <div className="space-y-2 pb-4">
            {unlockedListings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucune annonce débloquée</p>
            ) : (
              unlockedListings.map((listing) => (
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

        {activeTab === 'directions' && (
          <MapDirectionsPanel
            directionFrom={directionFrom}
            directionTo={directionTo}
            onClearFrom={onClearDirectionFrom}
            onClearTo={onClearDirectionTo}
            onClear={onClearDirections}
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
