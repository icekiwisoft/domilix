'use client';

import Link from 'next/link';
import { MapListing, MapFiltersState } from '../data/types';
import MapSearchBar from './MapSearchBar';
import MapListingCard from './MapListingCard';
import MapFilters from './MapFilters';
import MapFavorites from './MapFavorites';
import MapProPanel from './MapProPanel';

interface MapSidebarProps {
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

export default function MapSidebar({
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
  totalCount,
}: MapSidebarProps) {
  return (
    <aside className="hidden md:flex h-full w-[376px] min-w-[376px] p-2 pr-0">
      <div className="z-10 flex h-full w-[360px] min-w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">
            Domilix <span className="text-brand-500">Maps</span>
          </h1>
          <Link
            href="/houses"
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Retour
          </Link>
        </div>
        <MapSearchBar value={searchQuery} onChange={onSearchChange} />
      </div>

      <div className="flex border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 py-2.5 text-xs font-semibold transition relative ${
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

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-xs text-gray-400">
          {activeTab === 'listings' && `${listings.length} annonce${listings.length > 1 ? 's' : ''} sur ${totalCount}`}
          {activeTab === 'favorites' && `${favorites.length} favori${favorites.length > 1 ? 's' : ''}`}
        </div>

        {activeTab === 'listings' && (
          <div className="px-3 pb-4 space-y-2">
            {listings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune annonce trouvée</p>
            ) : (
              listings.map((listing) => (
                <MapListingCard
                  key={listing.id}
                  listing={listing}
                  isSelected={selectedListingId === listing.id}
                  isFavorite={isFavorite(listing.id)}
                  onSelect={() => onSelectListing(listing.id)}
                  onToggleFavorite={() => onToggleFavorite(listing)}
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
    </aside>
  );
}
