'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import MapBottomSheet from '@pages/Carte/components/MapBottomSheet';
import MapListingDetailsPanel from '@pages/Carte/components/MapListingDetailsPanel';
import MapSidebar from '@pages/Carte/components/MapSidebar';
import { MapListing, MapFiltersState, DEFAULT_FILTERS, MapTab, DirectionPoint } from '@pages/Carte/data/types';
import { unlockAd } from '@services/announceApi';
import { toggleLike } from '@services/favoritesApi';
import { getMapListings } from '@services/mapsApi';
import { MapsProvider, useMaps } from '@context/MapsContext';
import { useAuth } from '@hooks/useAuth';
import { signinDialogActions } from '@stores/defineStore';

const MapView = dynamic(() => import('@pages/Carte/components/MapView'), { ssr: false });

export default function Carte() {
  return (
    <MapsProvider>
      <CarteContent />
    </MapsProvider>
  );
}

function CarteContent() {
  const router = useRouter();
  const [listings, setListings] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscriptionActive, loading: mapsLoading } = useMaps();
  const { isAuthenticated, refreshProfile, user } = useAuth();
  const [favorites, setFavorites] = useState<MapListing[]>([]);
  const [unlockedListings, setUnlockedListings] = useState<MapListing[]>([]);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<number | null>(null);
  const [unlockLoadingId, setUnlockLoadingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<MapTab>('listings');
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [directionFrom, setDirectionFrom] = useState<DirectionPoint | null>(null);
  const [directionTo, setDirectionTo] = useState<DirectionPoint | null>(null);
  const [filters, setFilters] = useState<MapFiltersState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');

  const normalizeListing = useCallback((item: any): MapListing => {
    const medias = Array.isArray(item.medias)
      ? item.medias.map((media: any) => ({
        ...media,
        file: media.file || media.url || media.path || null,
        thumbnail: media.thumbnail || media.file || media.url || media.path || null,
      }))
      : [];

    return {
      ...item,
      type: item.type || (String(item.item_type || '').includes('Furniture') ? 'furniture' : 'realestate'),
      item_type: item.item_type || item.type || '',
      medias,
      thumbnail: item.thumbnail || medias.find((media: any) => media.thumbnail)?.thumbnail || medias.find((media: any) => media.file)?.file || null,
      is_liked: item.is_liked ?? item.liked ?? false,
      is_unlocked: item.is_unlocked ?? item.unlocked ?? false,
      advertiser_type: item.advertiser_type || 'Propriétaire',
    };
  }, []);

  const loadMapData = useCallback(async () => {
    setLoading(true);
    try {
      const [announcesResult, favoritesResult, unlockedResult] = await Promise.all([
        getMapListings({ per_page: '100' }),
        getMapListings({ per_page: '100', is_liked: '1' }),
        getMapListings({ per_page: '100', is_unlocked: '1' }),
      ]);

      const hasCoordinates = (item: MapListing) => typeof item.latitude === 'number' && typeof item.longitude === 'number';
      const favoriteData = favoritesResult.data.map(normalizeListing).filter(hasCoordinates).map((item) => ({ ...item, is_liked: true }));
      const unlockedData = unlockedResult.data.map(normalizeListing).filter(hasCoordinates).map((item) => ({ ...item, is_unlocked: true }));
      const favoriteIds = new Set(favoriteData.map((item) => item.id));
      const unlockedIds = new Set(unlockedData.map((item) => item.id));
      const announceData = announcesResult.data
        .map(normalizeListing)
        .filter(hasCoordinates)
        .map((item) => ({
          ...item,
          is_liked: item.is_liked === true || favoriteIds.has(item.id),
          is_unlocked: item.is_unlocked === true || unlockedIds.has(item.id),
        }));

      setListings(announceData);
      setFavorites(favoriteData);
      setUnlockedListings(unlockedData);
    } catch {
      setListings([]);
      setFavorites([]);
      setUnlockedListings([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeListing]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  const toggleFavorite = useCallback(async (listing: MapListing) => {
    if (favoriteLoadingId === listing.id) return;
    setFavoriteLoadingId(listing.id);

    const wasFavorite = listing.is_liked === true || favorites.some((item) => item.id === listing.id);
    setListings((prev) => prev.map((item) => item.id === listing.id ? { ...item, is_liked: !wasFavorite } : item));
    setFavorites((prev) => wasFavorite
      ? prev.filter((item) => item.id !== listing.id)
      : [{ ...listing, is_liked: true }, ...prev]);

    try {
      const result = await toggleLike(listing.id);
      setListings((prev) => prev.map((item) => item.id === listing.id ? { ...item, is_liked: result.liked } : item));
      setFavorites((prev) => {
        const exists = prev.some((item) => item.id === listing.id);
        if (result.liked && !exists) return [{ ...listing, is_liked: true }, ...prev];
        if (!result.liked) return prev.filter((item) => item.id !== listing.id);
        return prev;
      });
    } catch {
      setListings((prev) => prev.map((item) => item.id === listing.id ? { ...item, is_liked: wasFavorite } : item));
      setFavorites((prev) => wasFavorite
        ? [{ ...listing, is_liked: true }, ...prev.filter((item) => item.id !== listing.id)]
        : prev.filter((item) => item.id !== listing.id));
    } finally {
      setFavoriteLoadingId(null);
    }
  }, [favoriteLoadingId, favorites]);

  const isFavorite = useCallback(
    (id: number) => {
      const listing = listings.find((item) => item.id === id);
      if (listing) return listing.is_liked === true;
      const favorite = favorites.find((item) => item.id === id);
      return favorite?.is_liked === true;
    },
    [favorites, listings],
  );

  const unlockListing = useCallback(async (listing: MapListing) => {
    if (unlockLoadingId === listing.id || listing.is_unlocked) return;
    if (!isAuthenticated) {
      signinDialogActions.toggle();
      return;
    }
    if (Number(user?.credits || 0) <= 0) {
      window.location.href = '/subscriptions';
      return;
    }

    setUnlockLoadingId(listing.id);
    try {
      await unlockAd(listing.id);
      const markUnlocked = (item: MapListing) => item.id === listing.id ? { ...item, is_unlocked: true } : item;
      const unlockedListing = { ...listing, is_unlocked: true };
      setListings((prev) => prev.map(markUnlocked));
      setFavorites((prev) => prev.map(markUnlocked));
      setUnlockedListings((prev) => prev.some((item) => item.id === listing.id) ? prev.map(markUnlocked) : [unlockedListing, ...prev]);
      void refreshProfile().catch(() => undefined);
    } finally {
      setUnlockLoadingId(null);
    }
  }, [isAuthenticated, refreshProfile, unlockLoadingId, user?.credits]);

  const filterMapListings = useCallback((items: MapListing[]) => {
    return items.filter((listing) => {
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
  }, [searchQuery, filters]);

  const filteredListings = useMemo(() => filterMapListings(listings), [filterMapListings, listings]);
  const filteredFavorites = useMemo(() => filterMapListings(favorites), [filterMapListings, favorites]);
  const filteredUnlockedListings = useMemo(() => filterMapListings(unlockedListings), [filterMapListings, unlockedListings]);
  const mapListings = activeTab === 'favorites' ? filteredFavorites : activeTab === 'unlocked' ? filteredUnlockedListings : filteredListings;
  const selectedListing = useMemo(
    () => [...listings, ...favorites, ...unlockedListings].find((listing) => listing.id === selectedListingId) || null,
    [favorites, listings, selectedListingId, unlockedListings],
  );

  const cities = useMemo(
    () => [...new Set(listings.map((l) => l.city))].sort(),
    [listings],
  );

  const handleSelectListing = useCallback((id: number) => { setSelectedListingId(id); }, []);
  const handleMarkerClick = useCallback((listing: MapListing) => { setSelectedListingId(listing.id); }, []);

  useEffect(() => {
    if (!mapsLoading && !subscriptionActive) {
      router.replace('/maps/subscription');
    }
  }, [mapsLoading, subscriptionActive, router]);

  if (loading || mapsLoading) {
    return (
      <div className="fixed inset-0 z-[41] flex flex-col">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#E8921A]" />
            <p className="text-sm font-medium text-gray-400">Chargement de Domilix Maps…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionActive) return null;

  return (
    <div className="fixed inset-0 z-[41] flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <MapSidebar
            listings={filteredListings}
            favorites={filteredFavorites}
            unlockedListings={filteredUnlockedListings}
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
            directionFrom={directionFrom}
            directionTo={directionTo}
            onSetDirectionFrom={setDirectionFrom}
            onSetDirectionTo={setDirectionTo}
            onClearDirectionFrom={() => setDirectionFrom(null)}
            onClearDirectionTo={() => setDirectionTo(null)}
            onClearDirections={() => { setDirectionFrom(null); setDirectionTo(null); }}
          />
          <MapView
            listings={mapListings}
            selectedListingId={selectedListingId}
            onMarkerClick={handleMarkerClick}
            onSelectListing={handleSelectListing}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            directionFrom={directionFrom}
            directionTo={directionTo}
            onSetDirectionFrom={setDirectionFrom}
            onSetDirectionTo={setDirectionTo}
          />
          <MapBottomSheet
            listings={mapListings}
            favorites={filteredFavorites}
            unlockedListings={filteredUnlockedListings}
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
            directionFrom={directionFrom}
            directionTo={directionTo}
            onSetDirectionFrom={setDirectionFrom}
            onSetDirectionTo={setDirectionTo}
            onClearDirections={() => { setDirectionFrom(null); setDirectionTo(null); }}
          />
          <MapListingDetailsPanel
            listing={selectedListing}
            isFavorite={selectedListing ? isFavorite(selectedListing.id) : false}
            onClose={() => setSelectedListingId(null)}
            onToggleFavorite={toggleFavorite}
            onUnlock={unlockListing}
            isUnlocking={selectedListing ? unlockLoadingId === selectedListing.id : false}
          />
        </div>
      </div>
    </div>
  );
}
