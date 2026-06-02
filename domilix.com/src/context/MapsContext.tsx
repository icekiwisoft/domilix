'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { getAuthToken } from '@stores/defineStore';
import {
  subscribeMaps,
  getMapsSubscriptionStatus,
  cancelMapsSubscription,
  type MapsSubscription,
} from '@services/mapsApi';

interface MapsContextValue {
  subscription: MapsSubscription | null;
  subscriptionActive: boolean;
  loading: boolean;
  actionLoading: string | null;
  error: string | null;
  subscribe: (planId: string) => Promise<boolean>;
  cancel: () => Promise<void>;
  refresh: () => Promise<void>;
}

const MapsContext = createContext<MapsContextValue | null>(null);

export function MapsProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<MapsSubscription | null>(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!getAuthToken();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const subStatus = isAuthenticated ? await getMapsSubscriptionStatus() : null;
      if (subStatus) {
        setSubscriptionActive(subStatus.active);
        setSubscription(subStatus.subscription);
      } else {
        setSubscriptionActive(false);
        setSubscription(null);
      }
    } catch {
      setSubscriptionActive(false);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const subscribe = useCallback(async (planId: string) => {
    if (!planId || actionLoading) return false;
    setActionLoading(planId);
    setError(null);
    try {
      const result = await subscribeMaps(planId);
      setSubscriptionActive(true);
      setSubscription(result.subscription);
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de l'abonnement");
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading]);

  const cancel = useCallback(async () => {
    if (!window.confirm("Annuler votre abonnement Maps ?")) return;
    setActionLoading('cancel');
    setError(null);
    try {
      await cancelMapsSubscription();
      setSubscriptionActive(false);
      setSubscription(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de l'annulation");
    } finally {
      setActionLoading(null);
    }
  }, []);

  return (
    <MapsContext.Provider value={{
      subscription,
      subscriptionActive,
      loading,
      actionLoading,
      error,
      subscribe,
      cancel,
      refresh: fetchAll,
    }}>
      {children}
    </MapsContext.Provider>
  );
}

export function useMaps(): MapsContextValue {
  const ctx = useContext(MapsContext);
  if (!ctx) throw new Error('useMaps must be used within a MapsProvider');
  return ctx;
}
