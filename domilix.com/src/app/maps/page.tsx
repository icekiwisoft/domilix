'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import MapBottomSheet from '@pages/Carte/components/MapBottomSheet';
import MapListingDetailsPanel from '@pages/Carte/components/MapListingDetailsPanel';
import MapSidebar from '@pages/Carte/components/MapSidebar';
import { MapListing, MapFiltersState, DEFAULT_FILTERS, MapTab } from '@pages/Carte/data/types';
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

    const wasFavorite = favorites.some((item) => item.id === listing.id);
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

  return (
    <div className="fixed inset-0 z-[41] flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
      {subscriptionActive ? (
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
          />
          <MapView
            listings={mapListings}
            selectedListingId={selectedListingId}
            onMarkerClick={handleMarkerClick}
            onSelectListing={handleSelectListing}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
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
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#fff8f0]">
          <section className="relative min-h-full overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
            <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'linear-gradient(#e7d8c6 1px, transparent 1px), linear-gradient(90deg, #e7d8c6 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

            <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="max-w-2xl">
                <Link href="/houses" className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-700 shadow-sm transition hover:bg-white">
                  ← Retour aux annonces
                </Link>
                <p className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#E8921A]">
                  Nouveau service premium
                </p>
                <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-gray-950 sm:text-5xl lg:text-7xl">
                  Trouvez votre prochain bien par quartier, pas par hasard.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                  Domilix Maps transforme les annonces en carte interactive : visualisez les biens proches, comparez les prix autour d'une zone et ciblez les quartiers qui comptent vraiment.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/maps/subscription"
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#E8921A] to-orange-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-300/40 transition hover:from-orange-500 hover:to-orange-600"
                  >
                    Voir les packs Maps
                  </Link>
                  <Link
                    href="/houses"
                    className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-white px-6 py-4 text-sm font-black text-gray-800 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
                  >
                    Continuer sans Maps
                  </Link>
                </div>

                <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                  {[
                    ['Prix', 'sur carte'],
                    ['Quartiers', 'cibles'],
                    ['Contacts', 'via Domicoins'],
                  ].map(([value, label]) => (
                    <div key={value} className="rounded-2xl border border-orange-100 bg-white/80 p-4 shadow-sm">
                      <p className="text-lg font-black text-gray-950">{value}</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-2xl">
                <div className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white p-4 shadow-2xl shadow-orange-200/50">
                  <div className="relative h-[460px] overflow-hidden rounded-[1.5rem] bg-[#eef1e8]">
                    <div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'linear-gradient(30deg, rgba(148,163,184,0.28) 12%, transparent 12.5%, transparent 87%, rgba(148,163,184,0.28) 87.5%), linear-gradient(150deg, rgba(148,163,184,0.28) 12%, transparent 12.5%, transparent 87%, rgba(148,163,184,0.28) 87.5%)', backgroundSize: '72px 72px' }} />
                    <div className="absolute left-6 right-6 top-6 flex gap-2 overflow-hidden">
                      <div className="flex h-11 min-w-[270px] items-center gap-2 rounded-full border border-gray-200 bg-white px-4 shadow-lg">
                        <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-500">Akwa, Bonapriso, Bastos...</span>
                      </div>
                      {['Maison', 'Appartement'].map((chip) => (
                        <span key={chip} className="flex h-11 shrink-0 items-center rounded-full border border-gray-200 bg-white px-4 text-sm font-black text-gray-800 shadow-lg">
                          {chip}
                        </span>
                      ))}
                    </div>

                    {[
                      { price: '45k', position: 'left-[54%] top-[43%]', active: true },
                      { price: '120k', position: 'left-[32%] top-[56%]', active: false },
                      { price: '80k', position: 'left-[70%] top-[62%]', active: false },
                      { price: '250k', position: 'left-[47%] top-[72%]', active: false },
                    ].map((marker) => (
                      <div key={marker.price} className={`absolute ${marker.position} -translate-x-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-sm font-black shadow-lg ${marker.active ? 'bg-[#E8921A] text-white ring-4 ring-orange-200' : 'bg-white text-gray-900'}`}>
                        {marker.price}
                      </div>
                    ))}

                    <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-orange-100 bg-white/95 p-4 shadow-xl backdrop-blur">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-100 to-gray-100" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-gray-950">Appartement moderne a Douala</p>
                          <p className="mt-1 text-xs font-semibold text-gray-500">Bonapriso · 3 chambres</p>
                          <div className="mt-2 flex gap-1.5">
                            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-black text-orange-700">Agence</span>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">Verifie</span>
                          </div>
                        </div>
                        <p className="text-lg font-black text-[#E8921A]">250k</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      </div>
    </div>
  );
}
