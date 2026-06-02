'use client';

import { useState } from 'react';

import { useMaps } from '@context/MapsContext';
import { getAuthToken } from '@stores/defineStore';

const MAPS_PACKS = [
  { id: 'decouverte', label: 'Decouverte', price: 0, duration: '12h', unlockCount: 0 },
  { id: 'starter', label: 'Starter', price: 2000, duration: '30 jours', unlockCount: 5 },
  { id: 'pro', label: 'Pro', price: 5000, duration: '30 jours', unlockCount: 20, popular: true },
  { id: 'business', label: 'Business', price: 15000, duration: '30 jours', unlockCount: 50 },
];

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function getPlanFeatures(plan: typeof MAPS_PACKS[number]) {
  const base = ['Carte interactive des annonces', 'Filtres avances'];
  if (plan.unlockCount === 0) return base;
  return [
    ...base,
    `${plan.unlockCount} deblocage${plan.unlockCount > 1 ? 's' : ''} de contact`,
    'Coordonnees exactes des annonces',
  ];
}

export default function MapProPanel() {
  const { subscription, subscriptionActive, loading, actionLoading, error, subscribe, cancel } = useMaps();
  const [success, setSuccess] = useState<string | null>(null);
  const isAuthenticated = !!getAuthToken();

  const activePack = subscription ? MAPS_PACKS.find((plan) => plan.id === subscription.plan) : null;

  const handleSubscribe = async (plan: typeof MAPS_PACKS[number]) => {
    setSuccess(null);
    if (!isAuthenticated) {
      (window as any).__openSigninDialog?.();
      return;
    }
    if (subscriptionActive || actionLoading) return;
    const confirmed = plan.price === 0 || window.confirm(`Activer le pack ${plan.label} a ${plan.price.toLocaleString()} FCFA ?`);
    if (!confirmed) return;
    const activated = await subscribe(plan.id);
    if (activated) setSuccess(`Pack ${plan.label} active.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#eee0d2] border-t-[#E8921A]" />
      </div>
    );
  }

  if (subscriptionActive && subscription) {
    const endDate = subscription.end_date
      ? new Date(subscription.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      : null;

    return (
      <div className="space-y-3 p-4">
        <div className="overflow-hidden rounded-2xl bg-[#0d3556] text-white">
          <div className="px-5 py-5">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <MapIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white/50">Maps</p>
                <h3 className="text-base font-black leading-none text-white">Pack {activePack?.label || subscription.plan}</h3>
              </div>
              <span className="ml-auto rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">Actif</span>
            </div>

            <div className="mt-4 space-y-2">
              {subscription.unlock_count > 0 && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <CheckIcon className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{subscription.unlock_count} deblocage{subscription.unlock_count > 1 ? 's' : ''} de contact</span>
                </div>
              )}
              {endDate && <p className="text-sm text-white/60">Expire le {endDate}</p>}
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-3">
            <button
              type="button"
              onClick={cancel}
              disabled={actionLoading === 'cancel'}
              className="w-full rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/20 disabled:opacity-50"
            >
              {actionLoading === 'cancel' ? 'Annulation...' : "Resilier l'abonnement"}
            </button>
          </div>
        </div>

        {success && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">{success}</p>}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff8f4]">
          <MapIcon className="h-5 w-5 text-[#E8921A]" />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-950">Maps Pro</h3>
          <p className="text-xs text-gray-400">Accedez aux fonctionnalites Maps</p>
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}
      {success && <p className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">{success}</p>}

      <div className="space-y-2.5">
        {MAPS_PACKS.map((plan) => {
          const isFree = plan.price === 0;
          const isPro = plan.id === 'pro';
          const isLoading = actionLoading === plan.id;
          const features = getPlanFeatures(plan);

          return (
            <div
              key={plan.id}
              className={`overflow-hidden rounded-2xl border transition ${
                isPro ? 'border-[#E8921A]/30 bg-gradient-to-br from-orange-50 to-[#fff8f4]' : 'border-[#eee0d2] bg-white'
              }`}
            >
              {plan.popular && (
                <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#E8921A] to-orange-500 px-4 py-1.5 text-center shadow-lg shadow-orange-200/40">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Le plus populaire</span>
                </div>
              )}

              <div className="p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-gray-950">{plan.label}</h4>
                    <p className="mt-0.5 text-xs text-gray-400">{plan.duration}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-xl font-black ${isFree ? 'text-emerald-600' : 'text-gray-950'}`}>
                      {isFree ? 'Gratuit' : `${plan.price.toLocaleString()}`}
                    </p>
                    {!isFree && <p className="text-[10px] text-gray-400">FCFA / mois</p>}
                  </div>
                </div>

                <ul className="mb-4 space-y-1.5">
                  {features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <CheckIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isFree ? 'text-gray-400' : 'text-[#E8921A]'}`} />
                      <span className="text-xs text-gray-600">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSubscribe(plan)}
                  disabled={!!actionLoading}
                  className={`w-full rounded-xl py-2.5 text-sm font-black transition disabled:opacity-50 ${
                    isFree
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : isPro
                        ? 'bg-[#E8921A] text-white shadow-lg shadow-orange-900/15 hover:bg-orange-600'
                        : 'bg-[#0d3556] text-white hover:bg-[#0a2840]'
                  }`}
                >
                  {isLoading ? 'Activation...' : isFree ? 'Activer gratuitement' : `Activer ${plan.label}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-gray-400">Resiliez a tout moment depuis ce panneau.</p>
    </div>
  );
}
