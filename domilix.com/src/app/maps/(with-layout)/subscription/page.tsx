'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

import MapNav from '@components/MapNav/MapNav';
import { useMaps } from '@context/MapsContext';
import { getAuthToken } from '@stores/defineStore';

const MAPS_PACKS = [
  {
    id: 'decouverte',
    label: 'Decouverte',
    price: 0,
    duration: '12 heures',
    unlockCount: 0,
    accent: 'emerald',
    description: 'Tester Domilix Maps et explorer la carte sans engagement.',
  },
  {
    id: 'starter',
    label: 'Starter',
    price: 2000,
    duration: '30 jours',
    unlockCount: 5,
    accent: 'slate',
    description: 'Pour une recherche courte avec quelques contacts prioritaires.',
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 5000,
    duration: '30 jours',
    unlockCount: 20,
    accent: 'orange',
    description: 'Le meilleur choix pour chercher activement un logement.',
    popular: true,
  },
  {
    id: 'business',
    label: 'Business',
    price: 15000,
    duration: '30 jours',
    unlockCount: 50,
    accent: 'black',
    description: 'Pour les agences, chasseurs immobiliers et recherches intensives.',
  },
];

const BASE_FEATURES = [
  'Carte interactive des annonces',
  'Filtres par ville, quartier, prix et type',
  'Popup avec details du bien',
];

export default function SubscriptionPage() {
  const { subscription, subscriptionActive, loading, actionLoading, error, subscribe, cancel } = useMaps();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isAuthenticated = !!getAuthToken();

  const activePack = subscription ? MAPS_PACKS.find((pack) => pack.id === subscription.plan) : null;

  const handleActivatePack = async (pack: typeof MAPS_PACKS[number]) => {
    if (actionLoading) return;
    setSuccessMessage(null);

    if (subscriptionActive) return;

    const confirmed = pack.price === 0 || window.confirm(`Activer le pack ${pack.label} a ${pack.price.toLocaleString()} FCFA ?`);
    if (!confirmed) return;

    const activated = await subscribe(pack.id);
    if (activated) {
      setSuccessMessage(`Pack ${pack.label} active avec succes.`);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[41] flex flex-col bg-white">
        <MapNav />
        <main className="flex min-h-0 flex-1 items-center justify-center pt-14 md:pt-16">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#E8921A]" />
            <p className="text-sm font-medium text-gray-400">Chargement des abonnements Maps...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[41] flex flex-col bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <MapNav />
      <main className="min-h-0 flex-1 overflow-y-auto pt-14 md:pt-16">
        <section className="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center md:h-20 md:w-20">
              <Image src="/favicon.png" alt="Domilix" width={56} height={56} className="h-12 w-12 object-contain md:h-14 md:w-14" priority />
            </div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#E8921A]">Domilix Maps</p>
            <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl md:text-5xl">
              Choisissez votre pack Maps
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
              Les packs Maps donnent acces a la carte interactive et aux recherches geolocalisees. Les Domicoins restent separes pour debloquer les contacts.
            </p>
          </div>

          {subscriptionActive && subscription && (
            <div className="mx-auto mt-8 flex w-full max-w-2xl flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-white/90 p-5 text-center shadow-sm md:flex-row md:text-left">
              <div>
                <p className="text-sm font-black text-emerald-700">Abonnement actif</p>
                <p className="mt-1 text-sm text-gray-500">
                  Pack {activePack?.label || subscription.plan}
                  {subscription.end_date ? ` · expire le ${new Date(subscription.end_date).toLocaleDateString('fr-FR')}` : ''}
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/maps" className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600">
                  Voir la carte
                </Link>
                <button
                  type="button"
                  onClick={cancel}
                  disabled={actionLoading === 'cancel'}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {actionLoading === 'cancel' ? 'Annulation...' : 'Resilier'}
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center">
              <p className="text-sm font-bold text-amber-800">Connexion requise</p>
              <p className="mt-1 text-xs text-amber-600">Connectez-vous ou creez un compte pour activer un pack Maps.</p>
            </div>
          )}

          {error && (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm font-semibold text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {MAPS_PACKS.map((pack) => {
                const isFree = pack.price === 0;
                const isLoading = actionLoading === pack.id;
                const isBusy = !!actionLoading;
                const isPro = pack.id === 'pro';
                const isCurrentPack = subscription?.plan === pack.id && subscriptionActive;
                const features = pack.unlockCount > 0
                  ? [...BASE_FEATURES, `${pack.unlockCount} deblocage${pack.unlockCount > 1 ? 's' : ''} de contact`, 'Coordonnees exactes des biens']
                  : BASE_FEATURES;

                return (
                  <article
                    key={pack.id}
                    className={`relative flex min-h-[430px] flex-col overflow-hidden rounded-3xl border-2 bg-white transition duration-300 hover:-translate-y-1 ${
                      isPro
                        ? 'border-[#E8921A] shadow-xl shadow-orange-200/60'
                        : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-lg'
                    }`}
                    >
                    {isCurrentPack && (
                      <div className="absolute right-4 top-4 z-10 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                        Actif
                      </div>
                    )}

                      {pack.popular && (
                        <div className="bg-gradient-to-r from-[#E8921A] to-orange-500 px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.15em] text-white">
                          Le plus populaire
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-5">
                        <h2 className="text-xl font-black text-gray-950">{pack.label}</h2>
                        <p className="mt-2 min-h-[44px] text-sm leading-5 text-gray-500">{pack.description}</p>
                      </div>

                      <div className="mb-6 rounded-2xl bg-gray-50 p-4">
                        <p className={`text-3xl font-black tracking-tight ${isFree ? 'text-emerald-600' : 'text-gray-950'}`}>
                          {isFree ? 'Gratuit' : `${pack.price.toLocaleString()} FCFA`}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-gray-400">Validite : {pack.duration}</p>
                      </div>

                      <ul className="mb-6 flex-1 space-y-3">
                        {features.map((feature) => (
                          <li key={feature} className="flex gap-2.5 text-sm text-gray-600">
                            <svg className={`mt-0.5 h-4 w-4 shrink-0 ${isPro ? 'text-[#E8921A]' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={() => handleActivatePack(pack)}
                          disabled={isBusy || subscriptionActive}
                          className={`mt-auto w-full rounded-xl py-3 text-sm font-black transition disabled:opacity-50 ${
                            isFree
                              ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                              : isPro
                                ? 'bg-gradient-to-r from-[#E8921A] to-orange-500 text-white shadow-lg shadow-orange-200 hover:from-orange-500 hover:to-orange-600'
                                : 'bg-gray-950 text-white hover:bg-gray-800'
                          }`}
                        >
                          {isLoading
                            ? 'Activation...'
                            : isCurrentPack
                              ? 'Pack actif'
                              : subscriptionActive
                                ? 'Resiliez pour changer'
                                : isFree
                                  ? 'Activer gratuitement'
                                  : `Activer ${pack.label}`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => (window as any).__openSigninDialog?.()}
                          className="mt-auto w-full rounded-xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                        >
                          Se connecter
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

          <p className="mt-10 text-center text-[11px] text-gray-400">
            Tous les packs Maps sont affiches ici. Resiliation possible a tout moment.
          </p>
        </section>
      </main>
    </div>
  );
}
