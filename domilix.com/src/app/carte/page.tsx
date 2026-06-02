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
        const allPlans = getMapsPlans();
        const listingResult = getMapListings({ per_page: '100' });
        const subResult = isAuthenticated ? getMapsSubscriptionStatus() : Promise.resolve(null);

        const [plansData, dataResult, subStatus] = await Promise.all([allPlans, listingResult, subResult]);
        setPlans(plansData);

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
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500" />
      </div>
    );
  }

  const visiblePlans = plans.filter((p) => LAUNCH_PLANS.includes(p.id));

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
        <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-lg mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Domilix <span className="text-brand-500">Maps</span>
              </h1>
              <p className="text-sm text-gray-500">
                Explorez les annonces sur la carte interactive du Cameroun.
              </p>
            </div>

            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-amber-800 font-medium mb-1">
                  Connectez-vous pour accéder aux fonctionnalités Maps
                </p>
                <p className="text-xs text-amber-600">
                  Souscrivez à un plan pour voir les annonces sur la carte.
                </p>
              </div>
            )}

            {subscriptionActive && subscription && (
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white mb-6">
                <h3 className="text-lg font-bold mb-1">
                  Maps {plans.find((p) => p.id === subscription.plan)?.label || subscription.plan}
                </h3>
                <p className="text-sm text-emerald-100 mb-1">Votre abonnement est actif.</p>
                {subscription.end_date && (
                  <p className="text-xs text-emerald-200 mb-4">
                    Expire le {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={actionLoading === 'cancel'}
                  className="w-full py-2 rounded-xl bg-white text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition disabled:opacity-50"
                >
                  {actionLoading === 'cancel' ? 'Annulation...' : "Résilier l'abonnement"}
                </button>
              </div>
            )}

            {subError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs mb-4">
                {subError}
              </div>
            )}

            {!subscriptionActive && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 text-center">
                  Choisissez un plan pour accéder à la carte
                </h2>

                {visiblePlans.map((plan) => {
                  const isFree = plan.price === 0;
                  const isLoading = actionLoading === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-xl border p-5 transition ${
                        isFree
                          ? 'border-gray-200 bg-white'
                          : 'border-brand-200 bg-gradient-to-br from-brand-50 to-orange-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{plan.label}</h3>
                          {plan.duration_hours > 0 && (
                            <p className="text-xs text-gray-400">Valable {plan.duration_hours}h</p>
                          )}
                          {plan.duration_days > 0 && (
                            <p className="text-xs text-gray-400">{plan.duration_days} jours</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {isFree ? 'Gratuit' : `${plan.price.toLocaleString()} FCFA`}
                          </p>
                          {!isFree && <p className="text-[11px] text-gray-400">/ mois</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>
                          {plan.unlock_count === 0
                            ? 'Consultation de la carte uniquement'
                            : `${plan.unlock_count} déblocage${plan.unlock_count > 1 ? 's' : ''} de contact`}
                        </span>
                      </div>

                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={isLoading}
                          className={`w-full py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 ${
                            isFree
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-brand-500 text-white hover:bg-brand-600'
                          }`}
                        >
                          {isLoading
                            ? 'Abonnement...'
                            : isFree
                              ? 'Activer Découverte'
                              : `Souscrire à ${plan.label}`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => (window as any).__openSigninDialog?.()}
                          className="w-full py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 transition"
                        >
                          Connectez-vous
                        </button>
                      )}
                    </div>
                  );
                })}

                <p className="text-[11px] text-gray-400 text-center pt-2">
                  Résiliez à tout moment. Plans disponibles : Découverte, Pro, Business.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
