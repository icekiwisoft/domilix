'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import MapBottomSheet from '@pages/Carte/components/MapBottomSheet';
import MapSidebar from '@pages/Carte/components/MapSidebar';
import { MapListing, MapFiltersState, DEFAULT_FILTERS } from '@pages/Carte/data/types';
import { mockListings } from '@pages/Carte/data/mockListings';
import MapNav from '@components/MapNav/MapNav';
import { getMapListings } from '@services/mapsApi';
import { useMaps } from '@context/MapsContext';

const MapView = dynamic(() => import('@pages/Carte/components/MapView'), { ssr: false });

export default function Carte() {
  const [listings, setListings] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscriptionActive, loading: mapsLoading } = useMaps();
  const [favorites, setFavorites] = useState<MapListing[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'filters' | 'pro'>('listings');
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<MapFiltersState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const dataResult = await getMapListings({ per_page: '100' });
        const data = dataResult.data.map((item: any) => ({
          ...item,
          is_liked: item.is_liked ?? false,
          advertiser_type: item.advertiser_type || 'Propriétaire',
        }));
        setListings(data);
        setFavorites(data.filter((l: MapListing) => l.is_liked));
      } catch {
        setListings(mockListings);
        setFavorites(mockListings.filter((l) => l.is_liked));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFavorite = useCallback((listing: MapListing) => {
    setFavorites((prev) => {
      const exists = prev.find((l) => l.id === listing.id);
      if (exists) return prev.filter((l) => l.id !== listing.id);
      return [...prev, { ...listing, is_liked: true }];
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

  const handleSelectListing = useCallback((id: number) => { setSelectedListingId(id); }, []);
  const handleMarkerClick = useCallback((listing: MapListing) => { setSelectedListingId(listing.id); }, []);

  if (loading || mapsLoading) {
    return (
      <div className="fixed inset-0 z-[41] flex flex-col">
        <MapNav />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#E8921A]" />
            <p className="text-sm font-medium text-gray-400">Chargement de Domilix Maps…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[41] flex flex-col">
      <MapNav />
      <div className="flex min-h-0 flex-1 flex-col pt-14 md:pt-16">
      {subscriptionActive ? (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
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
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50">
          <div className="flex flex-col items-center px-4 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8921A] to-orange-500 shadow-lg shadow-orange-200 md:h-16 md:w-16">
              <svg className="h-7 w-7 text-white md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Domilix <span className="text-[#E8921A]">Maps</span>
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              Souscrivez à un plan pour accéder à la carte interactive.
            </p>
            <Link
              href="/maps/subscription"
              className="mt-6 rounded-xl bg-gradient-to-r from-[#E8921A] to-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:from-orange-500 hover:to-orange-600"
            >
              Voir les abonnements
            </Link>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
