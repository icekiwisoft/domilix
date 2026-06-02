'use client';

import { useEffect, useState } from 'react';
import {
  getMapsPlans,
  subscribeMaps,
  getMapsSubscriptionStatus,
  cancelMapsSubscription,
  type MapsPlan,
  type MapsSubscription,
} from '../../../services/mapsApi';
import { getAuthToken } from '../../../stores/defineStore';

const LAUNCH_PLANS = ['decouverte', 'pro', 'business'];

export default function MapProPanel() {
  const [plans, setPlans] = useState<MapsPlan[]>([]);
  const [subscription, setSubscription] = useState<MapsSubscription | null>(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!getAuthToken();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allPlans] = await Promise.all([
        getMapsPlans(),
        isAuthenticated ? getMapsSubscriptionStatus() : Promise.resolve(null),
      ]);
      setPlans(allPlans);
      if (isAuthenticated) {
        const status = await getMapsSubscriptionStatus();
        setActive(status.active);
        setSubscription(status.subscription);
      }
    } catch {
      setActive(false);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setActionLoading(planId);
    setError(null);
    try {
      const result = await subscribeMaps(planId);
      setActive(true);
      setSubscription(result.subscription);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de l'abonnement");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Annuler votre abonnement Maps ? Vous perdrez l\'accès aux fonctionnalités.')) return;
    setActionLoading('cancel');
    setError(null);
    try {
      await cancelMapsSubscription();
      setActive(false);
      setSubscription(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de l'annulation");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500" />
      </div>
    );
  }

  const visiblePlans = plans.filter((p) => LAUNCH_PLANS.includes(p.id));

  if (active && subscription) {
    const planCfg = plans.find((p) => p.id === subscription.plan);
    const endDate = subscription.end_date
      ? new Date(subscription.end_date).toLocaleDateString('fr-FR')
      : 'N/A';

    return (
      <div className="p-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h3 className="text-lg font-bold">Maps {planCfg?.label || subscription.plan}</h3>
          </div>
          <p className="text-sm text-emerald-100 mb-1">
            Votre abonnement est actif.
          </p>
          <p className="text-xs text-emerald-200 mb-1">
            {subscription.unlock_count} déblocage{subscription.unlock_count > 1 ? 's' : ''} de contact inclus
          </p>
          <p className="text-xs text-emerald-200 mb-4">
            Expire le {endDate}
          </p>
          <button
            type="button"
            onClick={handleCancel}
            disabled={actionLoading === 'cancel'}
            className="w-full py-2 rounded-xl bg-white text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition disabled:opacity-50"
          >
            {actionLoading === 'cancel' ? 'Annulation...' : "Résilier l'abonnement"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Abonnement Maps</h3>
        <p className="text-xs text-gray-400">
          Choisissez un plan pour débloquer plus de fonctionnalités.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs">
          {error}
        </div>
      )}

      {visiblePlans.map((plan) => {
        const isFree = plan.price === 0;
        const isLoading = actionLoading === plan.id;

        return (
          <div
            key={plan.id}
            className={`rounded-xl border p-4 transition ${
              isFree
                ? 'border-gray-200 bg-white'
                : 'border-brand-200 bg-gradient-to-br from-brand-50 to-orange-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-gray-900">{plan.label}</h4>
                {plan.duration_hours > 0 && (
                  <p className="text-xs text-gray-400">{plan.duration_hours}h</p>
                )}
                {plan.duration_days > 0 && (
                  <p className="text-xs text-gray-400">{plan.duration_days} jours</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {isFree ? 'Gratuit' : `${plan.price.toLocaleString()} FCFA`}
                </p>
                {!isFree && <p className="text-[10px] text-gray-400">/ mois</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>
                {plan.unlock_count === 0
                  ? 'Consultation de la carte uniquement'
                  : `${plan.unlock_count} déblocage${plan.unlock_count > 1 ? 's' : ''} de contact`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSubscribe(plan.id)}
              disabled={isLoading}
              className={`w-full py-2 rounded-xl text-sm font-bold transition disabled:opacity-50 ${
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
          </div>
        );
      })}

      <p className="text-[10px] text-gray-400 text-center pt-1">
        Résiliez à tout moment. Plans affichés : Découverte, Pro, Business.
      </p>
    </div>
  );
}
