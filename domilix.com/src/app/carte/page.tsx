'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { getAuthToken } from '@stores/defineStore';
import { getMapListings, getMapsPlans, subscribeMaps, getMapsSubscriptionStatus, cancelMapsSubscription, type MapsPlan, type MapsSubscription } from '@services/mapsApi';
import { mockListings } from '@pages/Carte/data/mockListings';
import { MapListing, MapFiltersState, DEFAULT_FILTERS } from '@pages/Carte/data/types';
import MapSidebar from '@pages/Carte/components/MapSidebar';
import MapBottomSheet from '@pages/Carte/components/MapBottomSheet';

const MapView = dynamic(() => import('@pages/Carte/components/MapView'), { ssr: false });

const LAUNCH_PLANS = ['decouverte', 'pro', 'business'];

const FALLBACK_PLANS: MapsPlan[] = [
  { id: 'decouverte', label: 'Découverte', price: 0, duration_days: 0, duration_hours: 12, unlock_count: 0 },
  { id: 'pro', label: 'Pro', price: 5000, duration_days: 30, duration_hours: 0, unlock_count: 20 },
  { id: 'business', label: 'Business', price: 15000, duration_days: 30, duration_hours: 0, unlock_count: 50 },
];

export default function Carte() {
  const [listings, setListings] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<MapsPlan[]>([]);
  const [subscription, setSubscription] = useState<MapsSubscription | null>(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [subError, setSubError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<MapListing[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'filters' | 'pro'>('listings');
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<MapFiltersState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthenticated = !!getAuthToken();

  useEffect(() => {
    (async () => {
      try {
        const subResult = isAuthenticated ? getMapsSubscriptionStatus() : Promise.resolve(null);
        const [plansData, dataResult, subStatus] = await Promise.all([
          getMapsPlans(),
          getMapListings({ per_page: '100' }),
          subResult,
        ]);

        setPlans(plansData?.length ? plansData : FALLBACK_PLANS);

        if (subStatus) {
          setSubscriptionActive(subStatus.active);
          setSubscription(subStatus.subscription);
        }

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
        setPlans(FALLBACK_PLANS);
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

  const handleSelectListing = useCallback((id: number) => {
    setSelectedListingId(id);
  }, []);

  const handleMarkerClick = useCallback((listing: MapListing) => {
    setSelectedListingId(listing.id);
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!planId) return;
    setActionLoading(planId);
    setSubError(null);
    try {
      const result = await subscribeMaps(planId);
      setSubscriptionActive(true);
      setSubscription(result.subscription);
    } catch (err: any) {
      setSubError(err?.response?.data?.message || err.message || "Erreur lors de l'abonnement");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Annuler votre abonnement Maps ?")) return;
    setActionLoading('cancel');
    setSubError(null);
    try {
      await cancelMapsSubscription();
      setSubscriptionActive(false);
      setSubscription(null);
    } catch (err: any) {
      setSubError(err?.response?.data?.message || err.message || "Erreur lors de l'annulation");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#fff8f4]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#eee0d2] border-t-[#E8921A]" />
      </div>
    );
  }

  const visiblePlans = plans.filter((p) => LAUNCH_PLANS.includes(p.id));

  const getPlanFeatures = (plan: MapsPlan) => {
    const base = ['Carte interactive des annonces', 'Filtres ville, prix, type'];
    if (plan.unlock_count === 0) return base;
    return [...base, `${plan.unlock_count} déblocage${plan.unlock_count > 1 ? 's' : ''} de contact`, 'Coordonnées exactes'];
  };

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      {subscriptionActive ? (
        <>
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
        </>
      ) : (
        /* ══════════════════════════════════════════════════════
           PAGE DE GARDE — CHOIX D'ABONNEMENT
        ══════════════════════════════════════════════════════ */
        <div className="relative w-full h-full overflow-hidden">
          {/* Fond carte floutée */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400')" }}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Contenu */}
          <div className="relative z-10 h-full overflow-y-auto">
            <div className="min-h-full flex flex-col items-center justify-center px-4 py-12">
              <div className="w-full max-w-4xl">

                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8921A] shadow-xl shadow-orange-900/30">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Domilix <span className="text-[#E8921A]">Maps</span>
                  </h1>
                  <p className="mt-2 text-base text-white/65">
                    Explorez les annonces immobilières sur la carte interactive du Cameroun.
                  </p>
                </div>

                {/* Alerte non connecté */}
                {!isAuthenticated && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 backdrop-blur-sm">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-yellow-300">Connexion requise</p>
                      <p className="text-xs text-yellow-200/80">Connectez-vous pour accéder à Domilix Maps.</p>
                    </div>
                  </div>
                )}

                {/* Erreur */}
                {subError && (
                  <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300 backdrop-blur-sm">
                    {subError}
                  </div>
                )}

                {/* Plans */}
                <div className="space-y-3">
                  <p className="mb-4 text-center text-xs font-black uppercase tracking-widest text-white/40">
                    Choisissez votre plan
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {visiblePlans.map((plan) => {
                    const isFree    = plan.price === 0;
                    const isPro     = plan.id === 'pro';
                    const isLoading = actionLoading === plan.id;
                    const duration  = plan.duration_hours > 0
                      ? `${plan.duration_hours}h d'accès`
                      : plan.duration_days > 0
                        ? `${plan.duration_days} jours`
                        : '';

                    return (
                      <div
                        key={plan.id}
                        className={`overflow-hidden rounded-2xl border backdrop-blur-sm transition
                          ${isPro
                            ? 'border-[#E8921A]/50 bg-white/15'
                            : 'border-white/15 bg-white/8'
                          }`}
                      >
                        {isPro && (
                          <div className="bg-[#E8921A] px-4 py-1.5 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">⭐ Le plus populaire</span>
                          </div>
                        )}

                        <div className="p-5">
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-black text-white">{plan.label}</h3>
                              {duration && <p className="mt-0.5 text-xs text-white/50">{duration}</p>}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className={`text-xl font-black ${isFree ? 'text-emerald-400' : 'text-white'}`}>
                                {isFree ? 'Gratuit' : `${plan.price.toLocaleString()}`}
                              </p>
                              {!isFree && <p className="text-[10px] text-white/40">FCFA / mois</p>}
                            </div>
                          </div>

                          <ul className="mb-5 space-y-1.5">
                            {getPlanFeatures(plan).map((feat) => (
                              <li key={feat} className="flex items-center gap-2">
                                <svg className={`h-3.5 w-3.5 shrink-0 ${isFree ? 'text-white/40' : 'text-[#E8921A]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs text-white/70">{feat}</span>
                              </li>
                            ))}
                          </ul>

                          {isAuthenticated ? (
                            <button
                              type="button"
                              onClick={() => handleSubscribe(plan.id)}
                              disabled={isLoading}
                              className={`w-full rounded-xl py-3 text-sm font-black transition disabled:opacity-50
                                ${isFree
                                  ? 'bg-white/15 text-white hover:bg-white/25'
                                  : isPro
                                    ? 'bg-[#E8921A] text-white shadow-lg shadow-orange-900/30 hover:bg-orange-600'
                                    : 'bg-[#0d3556] text-white hover:bg-[#0a2840]'
                                }`}
                            >
                              {isLoading
                                ? 'Activation...'
                                : isFree
                                  ? 'Activer gratuitement'
                                  : `Souscrire — ${plan.price.toLocaleString()} FCFA`}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => (window as any).__openSigninDialog?.()}
                              className="w-full rounded-xl bg-white py-3 text-sm font-black text-gray-900 transition hover:bg-gray-100"
                            >
                              Se connecter
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>

                <p className="mt-5 text-center text-[10px] text-white/30">
                  Résiliez à tout moment · Plans : Découverte, Pro, Business
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
