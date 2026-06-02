'use client';

import { useState, useCallback, useMemo } from 'react';
import MapView from './components/MapView';
import MapSidebar from './components/MapSidebar';
import MapBottomSheet from './components/MapBottomSheet';
import { mockListings } from './data/mockListings';
import { MapListing, MapFiltersState, DEFAULT_FILTERS } from './data/types';

export default function Carte() {
  const [listings] = useState<MapListing[]>(mockListings);
  const [favorites, setFavorites] = useState<MapListing[]>(
    () => mockListings.filter((l) => l.is_favorite),
  );
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'filters' | 'pro'>('listings');
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<MapFiltersState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFavorite = useCallback((listing: MapListing) => {
    setFavorites((prev) => {
      const exists = prev.find((l) => l.id === listing.id);
      if (exists) return prev.filter((l) => l.id !== listing.id);
      return [...prev, listing];
    });
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.some((l) => l.id === id),
    [favorites],
  );

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          listing.title.toLowerCase().includes(q) ||
          listing.city.toLowerCase().includes(q) ||
          listing.neighbourhood.toLowerCase().includes(q) ||
          listing.advertiser_name.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (filters.city && listing.city !== filters.city) return false;
      if (filters.item_type && listing.item_type !== filters.item_type) return false;
      if (filters.ad_type && listing.ad_type !== filters.ad_type) return false;
      if (filters.price_min && listing.price < parseInt(filters.price_min)) return false;
      if (filters.price_max && listing.price > parseInt(filters.price_max)) return false;
      if (filters.verified_only && !listing.is_verified) return false;
      return true;
    });
  }, [listings, searchQuery, filters]);

  const cities = useMemo(
    () => [...new Set(listings.map((l) => l.city))].sort(),
    [listings],
  );

  const handleSelectListing = useCallback((id: number) => {
    setSelectedListingId(id);
  }, []);

  const selectedListing = useMemo(
    () => (selectedListingId ? listings.find((l) => l.id === selectedListingId) ?? null : null),
    [selectedListingId, listings],
  );

  const handleMarkerClick = useCallback((listing: MapListing) => {
    setSelectedListingId(listing.id);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      <MapSidebar
        listings={filteredListings}
        favorites={favorites}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedListingId={selectedListingId}
        onSelectListing={handleSelectListing}
        onToggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        cities={cities}
        totalCount={listings.length}
      />
      <MapView
        listings={filteredListings}
        selectedListingId={selectedListingId}
        onMarkerClick={handleMarkerClick}
        onSelectListing={handleSelectListing}
        onToggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
      <MapBottomSheet
        listings={filteredListings}
        favorites={favorites}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedListingId={selectedListingId}
        onSelectListing={handleSelectListing}
        onToggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        cities={cities}
        totalCount={listings.length}
      />
    </div>
  );
}
