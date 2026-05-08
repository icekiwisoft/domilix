'use client';

import { motion } from 'framer-motion';
import L from 'leaflet';
import React, { useEffect, useState } from 'react';
import {
  FaBath,
  FaBed,
  FaCar,
  FaCouch,
  FaDoorOpen,
  FaRulerCombined,
  FaSwimmingPool,
  FaTree,
  FaUtensils,
  FaWifi,
} from 'react-icons/fa';
import {
  HiCheckBadge,
  HiCheckCircle,
  HiChevronRight,
  HiExclamationTriangle,
  HiHeart,
  HiLockClosed,
  HiMapPin,
  HiOutlineHeart,
  HiOutlineShare,
} from 'react-icons/hi2';
import { MdAcUnit, MdSecurity, MdTv, MdVerifiedUser } from 'react-icons/md';

import Footer2 from '@components/Footer2/Footer2';
import MapboxMap from '@components/MapboxMap/MapboxMap';
import MediasDialog from '@components/MediasDialog/MediasDialog';
import Nav2 from '@components/Nav2/Nav2';
import ShareModal from '@components/ShareModal/ShareModal';
import SignalDialog from '@components/SignalDialog/SignalDialog';
import UnlockDialog from '@components/UnlockDialog/UnlockDialog';
import { useNavigate, useParams } from '@router';
import { getAd, getAds, unlockAd } from '@services/announceApi';
import { toggleLike } from '@services/favoritesApi';
import { signinDialogActions } from '@stores/defineStore';
import { mediaUrl } from '@utils/mediaUrl';

import { useAuth } from '../../hooks/useAuth';
import { Ad as AdType, Media } from '../../utils/types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function AdSkeleton() {
  return (
    <>
      <Nav2 />
      <div className='min-h-screen bg-white pt-20'>
        <main className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
          <div className='mb-6 flex gap-2'>
            <div className='h-4 w-24 animate-pulse rounded-full bg-gray-300' />
            <div className='h-4 w-4 animate-pulse rounded-full bg-gray-300' />
            <div className='h-4 w-32 animate-pulse rounded-full bg-gray-300' />
          </div>

          <div className='mb-6 flex flex-col justify-between gap-4 sm:flex-row'>
            <div className='flex-1 space-y-3'>
              <div className='flex gap-2'>
                <div className='h-7 w-24 animate-pulse rounded-full bg-gray-300' />
                <div className='h-7 w-20 animate-pulse rounded-full bg-gray-300' />
              </div>
              <div className='h-9 w-4/5 animate-pulse rounded-full bg-gray-400' />
              <div className='h-5 w-56 animate-pulse rounded-full bg-gray-300' />
            </div>
            <div className='h-11 w-36 animate-pulse rounded-2xl bg-gray-300' />
          </div>

          <div className='mb-8 grid h-[340px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[440px] lg:h-[500px]'>
            <div className='col-span-2 row-span-2 animate-pulse bg-gray-400' />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='animate-pulse bg-gray-300' />
            ))}
          </div>

          <div className='mb-10 flex flex-wrap items-stretch overflow-hidden rounded-2xl border border-gray-200 bg-gray-200'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='flex min-w-[130px] flex-1 items-center justify-center gap-3 border-r border-gray-300 px-6 py-4 last:border-r-0'>
                <div className='h-8 w-8 animate-pulse rounded-xl bg-gray-400' />
                <div className='space-y-2'>
                  <div className='h-4 w-10 animate-pulse rounded-full bg-gray-400' />
                  <div className='h-3 w-16 animate-pulse rounded-full bg-gray-300' />
                </div>
              </div>
            ))}
          </div>

          <div className='relative grid grid-cols-1 gap-12 lg:grid-cols-3'>
            <div className='space-y-0 lg:col-span-2'>
              <div className='flex items-center justify-between border-b border-gray-200 pb-8'>
                <div className='space-y-3'>
                  <div className='h-6 w-56 animate-pulse rounded-full bg-gray-400' />
                  <div className='h-4 w-36 animate-pulse rounded-full bg-gray-300' />
                </div>
                <div className='h-14 w-14 animate-pulse rounded-full bg-gray-400' />
              </div>

              <div className='grid grid-cols-1 gap-6 border-b border-gray-200 py-8 sm:grid-cols-2'>
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className='flex items-start gap-4'>
                    <div className='h-10 w-10 animate-pulse rounded-xl bg-gray-300' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 w-36 animate-pulse rounded-full bg-gray-400' />
                      <div className='h-4 w-full animate-pulse rounded-full bg-gray-300' />
                    </div>
                  </div>
                ))}
              </div>

              <div className='border-b border-gray-200 py-8'>
                <div className='mb-4 h-6 w-52 animate-pulse rounded-full bg-gray-400' />
                <div className='space-y-3'>
                  <div className='h-4 w-full animate-pulse rounded-full bg-gray-300' />
                  <div className='h-4 w-11/12 animate-pulse rounded-full bg-gray-300' />
                  <div className='h-4 w-2/3 animate-pulse rounded-full bg-gray-300' />
                </div>
              </div>

              <div className='border-b border-gray-200 py-8'>
                <div className='mb-5 h-6 w-48 animate-pulse rounded-full bg-gray-400' />
                <div className='flex flex-wrap gap-3'>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className='h-11 w-36 animate-pulse rounded-xl bg-gray-300' />
                  ))}
                </div>
              </div>

              <div className='py-8'>
                <div className='mb-2 h-6 w-32 animate-pulse rounded-full bg-gray-400' />
                <div className='mb-5 h-4 w-56 animate-pulse rounded-full bg-gray-300' />
                <div className='h-72 animate-pulse rounded-3xl bg-gray-300' />
              </div>
            </div>

            <div className='lg:col-span-1'>
              <div className='sticky top-28 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-lg'>
                <div className='h-1 bg-gray-400' />
                <div className='space-y-6 p-6'>
                  <div className='space-y-3'>
                    <div className='h-3 w-28 animate-pulse rounded-full bg-gray-300' />
                    <div className='h-9 w-44 animate-pulse rounded-full bg-gray-400' />
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <div className='h-8 w-28 animate-pulse rounded-lg bg-gray-300' />
                    <div className='h-8 w-24 animate-pulse rounded-lg bg-gray-300' />
                    <div className='h-8 w-36 animate-pulse rounded-lg bg-gray-300' />
                  </div>
                  <div className='h-28 animate-pulse rounded-2xl bg-gray-300' />
                  <div className='h-12 animate-pulse rounded-xl bg-gray-400' />
                  <div className='h-12 animate-pulse rounded-xl bg-gray-300' />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function AdErrorState() {
  return (
    <>
      <Nav2 />
      <div className='flex min-h-screen items-center justify-center bg-white px-5 pt-20 text-center'>
        <div className='max-w-md'>
          <div className='mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-red-50 text-red-500'>
            <svg viewBox='0 0 120 120' className='h-20 w-20' fill='none' aria-hidden='true'>
              <path d='M24 70 60 23l36 47v28H24V70Z' fill='#FEF2F2' stroke='currentColor' strokeWidth='5' strokeLinejoin='round' />
              <path d='M60 46v23' stroke='currentColor' strokeWidth='7' strokeLinecap='round' />
              <circle cx='60' cy='82' r='4' fill='currentColor' />
              <path d='M30 28 20 18M93 29l10-10M15 54H4M116 54h-11' stroke='#FCA5A5' strokeWidth='5' strokeLinecap='round' />
            </svg>
          </div>
          <p className='text-xs font-black uppercase tracking-[0.24em] text-red-500'>
            Erreur serveur
          </p>
          <h2 className='mt-3 text-3xl font-black tracking-tight text-slate-950'>
            Impossible de charger cette annonce
          </h2>
          <p className='mt-3 text-sm leading-6 text-slate-500'>
            Une erreur interne est survenue. Veuillez réessayer dans quelques instants.
          </p>
        </div>
      </div>
    </>
  );
}

function AdNotFoundState() {
  return (
    <>
      <Nav2 />
      <div className='flex min-h-screen items-center justify-center bg-white px-5 pt-20 text-center'>
        <div className='max-w-md'>
          <div className='mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-orange-50 text-orange-500'>
            <svg viewBox='0 0 120 120' className='h-20 w-20' fill='none' aria-hidden='true'>
              <path d='M28 35h64v55a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V35Z' fill='#FFF4E5' stroke='currentColor' strokeWidth='5' />
              <path d='M43 54h34M43 68h21' stroke='currentColor' strokeWidth='5' strokeLinecap='round' />
              <path d='M88 27 99 16M99 39h13M20 25l10 10' stroke='#FDBA74' strokeWidth='5' strokeLinecap='round' />
              <circle cx='29' cy='88' r='5' fill='currentColor' />
            </svg>
          </div>
          <p className='text-xs font-black uppercase tracking-[0.24em] text-orange-500'>
            Introuvable
          </p>
          <h2 className='mt-3 text-3xl font-black tracking-tight text-slate-950'>
            Annonce introuvable
          </h2>
          <p className='mt-3 text-sm leading-6 text-slate-500'>
            Cette annonce n’existe pas ou n’est plus disponible.
          </p>
        </div>
      </div>
    </>
  );
}

function isVideoMedia(media?: Media | null) {
  return Boolean(media?.type?.toLowerCase().startsWith('video/'));
}

function GalleryMediaPreview({
  media,
  className,
  onClick,
  showCount,
}: {
  media?: Media;
  className?: string;
  onClick?: () => void;
  showCount?: number;
}) {
  const src = mediaUrl(media?.file);

  return (
    <button
      type='button'
      className={`relative overflow-hidden bg-gray-100 text-left transition-all duration-300 hover:brightness-90 ${className || ''}`}
      onClick={onClick}
      disabled={!media && !showCount}
    >
      {media && src ? (
        isVideoMedia(media) ? (
          <>
            <video
              src={src}
              className='h-full w-full object-cover'
              muted
              playsInline
              preload='metadata'
            />
            <span className='absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm'>
              Vidéo
            </span>
            <span className='absolute inset-0 flex items-center justify-center'>
              <span className='flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg'>
                <span className='ml-1 h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-current' />
              </span>
            </span>
          </>
        ) : (
          <img src={src} alt='' className='h-full w-full object-cover' loading='lazy' />
        )
      ) : null}

      {showCount ? (
        <span className='absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-gray-800 shadow-md backdrop-blur-sm transition-colors hover:bg-white'>
          <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 10h16M4 14h16M4 18h16' />
          </svg>
          {showCount} médias
        </span>
      ) : null}
    </button>
  );
}

export default function Ad(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const adId = Array.isArray(id) ? id[0] : id;

  const [adInfo, setAdInfo] = useState<AdType | null>(null);
  const [similarAds, setSimilarAds] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showSignalDialog, setShowSignalDialog] = useState(false);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const hasCredits = Number(user?.credits || 0) > 0;

  const openModalWithImage = (index: number) => {
    setModalInitialIndex(index);
    setShowModal(true);
  };

  const handleUnlock = async () => {
    if (!adInfo) return;
    if (!isAuthenticated) {
      signinDialogActions.toggle();
      return;
    }
    if (!hasCredits) {
      navigate('/subscriptions');
      return;
    }
    try {
      await unlockAd(adInfo.id);
      const updated = await getAd(adInfo.id);
      setAdInfo(updated);
      setShowUnlockDialog(false);
    } catch {
      // handled silently
    }
  };

  const handleSignal = (_reason: string, _details: string) => {
    setShowSignalDialog(false);
  };

  const handleLike = async () => {
    if (isLiking) return;
    if (!isAuthenticated) {
      signinDialogActions.toggle();
      return;
    }
    try {
      setIsLiking(true);
      const response = await toggleLike(adInfo!.id);
      setLiked(response.liked);
    } catch {
      // handled silently
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    if (!adId) return;
    setLoading(true);
    setServerError(false);
    setNotFound(false);
    setAdInfo(null);
    getAd(parseInt(adId))
      .then(ad => {
        setAdInfo(ad);
        setLiked(ad.liked || false);
        return getAds({ type: ad.type });
      })
      .then(ads => {
        const list: AdType[] = Array.isArray(ads) ? ads : (ads as any).data || [];
        setSimilarAds(list.filter(a => a.id !== parseInt(adId!)).slice(0, 4));
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) {
          setNotFound(true);
        } else {
          setServerError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [adId]);

  if (loading) {
    return <AdSkeleton />;
  }

  if (serverError) {
    return <AdErrorState />;
  }

  if (notFound) {
    return <AdNotFoundState />;
  }

  if (!adInfo) {
    return <AdNotFoundState />;
  }

  const isRealestate = adInfo.type === 'realestate';
  const isForRent = adInfo.ad_type === 'location';
  const ad = adInfo as any;

  const amenities = [
    isRealestate && adInfo.wifi && { icon: <FaWifi />, label: 'WiFi inclus' },
    isRealestate && adInfo.air_conditioning && { icon: <MdAcUnit />, label: 'Climatisation' },
    isRealestate && adInfo.security_24h && { icon: <MdSecurity />, label: 'Sécurité 24h/24' },
    isRealestate && adInfo.equipped_kitchen && { icon: <FaUtensils />, label: 'Cuisine équipée' },
    isRealestate && adInfo.smart_tv && { icon: <MdTv />, label: 'Smart TV' },
    isRealestate && adInfo.pool && { icon: <FaSwimmingPool />, label: 'Piscine' },
    isRealestate && adInfo.gate && { icon: <FaDoorOpen />, label: 'Portail sécurisé' },
    isRealestate && adInfo.garden && { icon: <FaTree />, label: 'Jardin' },
    ad.garage && { icon: <FaCar />, label: 'Parking / Garage' },
    isRealestate && ad.furnitured && { icon: <FaCouch />, label: 'Meublé' },
  ].filter(Boolean) as { icon: React.ReactNode; label: string }[];

  return (
    <>
      <Nav2 />
      <div className='min-h-screen bg-white pt-20'>
        <main className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>

          {/* ── Breadcrumb ── */}
          <nav className='flex items-center gap-1.5 text-sm text-gray-400 mb-6'>
            <span>{adInfo.country || 'Cameroun'}</span>
            <HiChevronRight className='text-xs' />
            <span>{adInfo.city || 'Localisation'}</span>
            <HiChevronRight className='text-xs' />
            <span className='text-gray-700 font-medium'>{adInfo.category?.name || 'Annonce'}</span>
          </nav>

          {/* ── Title row ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6'
          >
            <div className='flex-1 min-w-0'>
              {/* Badges */}
              <div className='flex flex-wrap items-center gap-2 mb-3'>
                <span className='px-2.5 py-1 bg-orange-50 text-primary border border-orange-100 rounded-full text-[11px] font-semibold uppercase tracking-wide'>
                  {adInfo.category?.name || (isRealestate ? 'Immobilier' : 'Mobilier')}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border ${isForRent ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                  {isForRent ? 'Location' : 'Vente'}
                </span>
                {adInfo.announcer?.verified && (
                  <span className='flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[11px] font-semibold'>
                    <HiCheckBadge className='text-sm' />
                    Annonceur vérifié
                  </span>
                )}
                {!adInfo.unlocked && (
                  <span className='flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[11px] font-semibold'>
                    <HiLockClosed className='text-xs' />
                    Accès par crédits
                  </span>
                )}
              </div>

              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight'>
                {isRealestate ? 'Logement' : 'Meuble'}
                {adInfo.city && ` à ${adInfo.city}`}
              </h1>

              <div className='flex items-center gap-1.5 text-gray-500 text-sm'>
                <HiMapPin className='text-primary flex-shrink-0 text-base' />
                <span>
                  {[adInfo.address, adInfo.city, adInfo.country]
                    .filter(Boolean)
                    .join(', ') || 'Localisation non précisée'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex items-center gap-2 flex-shrink-0'>
              <button
                onClick={() => setShowShareModal(true)}
                className='flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors bg-white'
              >
                <HiOutlineShare className='text-base' />
                Partager
              </button>
              <button
                type='button'
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${liked
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-400'
                  }`}
              >
                {liked ? <HiHeart className='text-base' /> : <HiOutlineHeart className='text-base' />}
                {liked ? 'Sauvegardé' : 'Sauvegarder'}
              </button>
            </div>
          </motion.div>

          {/* ── Gallery ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='grid grid-cols-4 grid-rows-2 gap-2 h-[340px] sm:h-[440px] lg:h-[500px] mb-8 rounded-2xl overflow-hidden'
          >
            {adInfo.medias && adInfo.medias.length > 0 ? (
              <>
                <GalleryMediaPreview
                  media={adInfo.medias[0]}
                  className='col-span-2 row-span-2 cursor-pointer hover:brightness-95'
                  onClick={() => openModalWithImage(0)}
                />
                {[1, 2, 3].map(i => (
                  <GalleryMediaPreview
                    key={i}
                    media={adInfo.medias[i]}
                    className='cursor-pointer'
                    onClick={() => adInfo.medias[i] && openModalWithImage(i)}
                  />
                ))}
                <GalleryMediaPreview
                  media={adInfo.medias[4]}
                  className='cursor-pointer'
                  onClick={() => openModalWithImage(0)}
                  showCount={adInfo.medias.length}
                />
              </>
            ) : (
              <div className='col-span-4 row-span-2 flex items-center justify-center bg-gray-50 rounded-2xl'>
                <div className='text-center text-gray-400'>
                  <div className='text-4xl mb-2'>📷</div>
                  <p className='text-sm font-medium'>Aucune image disponible</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Quick-stats strip ── */}
          {isRealestate && (adInfo.bedroom || adInfo.toilet || adInfo.mainroom || adInfo.size) && (
            <div className='flex flex-wrap items-stretch bg-gray-50 border border-gray-100 rounded-2xl divide-x divide-gray-200 mb-10 overflow-hidden'>
              {adInfo.bedroom ? (
                <div className='flex items-center gap-3 px-6 py-4 flex-1 justify-center min-w-[130px]'>
                  <FaBed className='text-primary text-xl flex-shrink-0' />
                  <div>
                    <p className='text-lg font-bold text-gray-900 leading-none'>{adInfo.bedroom}</p>
                    <p className='text-xs text-gray-500 mt-0.5'>Chambre{adInfo.bedroom > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ) : null}
              {adInfo.toilet ? (
                <div className='flex items-center gap-3 px-6 py-4 flex-1 justify-center min-w-[130px]'>
                  <FaBath className='text-primary text-xl flex-shrink-0' />
                  <div>
                    <p className='text-lg font-bold text-gray-900 leading-none'>{adInfo.toilet}</p>
                    <p className='text-xs text-gray-500 mt-0.5'>Salle{adInfo.toilet > 1 ? 's' : ''} de bain</p>
                  </div>
                </div>
              ) : null}
              {adInfo.mainroom ? (
                <div className='flex items-center gap-3 px-6 py-4 flex-1 justify-center min-w-[130px]'>
                  <FaCouch className='text-primary text-xl flex-shrink-0' />
                  <div>
                    <p className='text-lg font-bold text-gray-900 leading-none'>{adInfo.mainroom}</p>
                    <p className='text-xs text-gray-500 mt-0.5'>Salon{adInfo.mainroom > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ) : null}
              {adInfo.size ? (
                <div className='flex items-center gap-3 px-6 py-4 flex-1 justify-center min-w-[130px]'>
                  <FaRulerCombined className='text-primary text-xl flex-shrink-0' />
                  <div>
                    <p className='text-lg font-bold text-gray-900 leading-none'>{adInfo.size} m²</p>
                    <p className='text-xs text-gray-500 mt-0.5'>Superficie</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ── Content grid ── */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-12 relative'>

            {/* ── Left column ── */}
            <div className='lg:col-span-2 space-y-0'>

              {/* Host strip */}
              <div className='flex items-center justify-between pb-8 border-b border-gray-100'>
                <div>
                  <h2 className='text-xl font-bold text-gray-900 mb-1'>
                    Proposé par {adInfo.announcer?.name || 'Annonceur'}
                  </h2>
                  <p className='text-sm text-gray-400 font-medium'>
                    {isRealestate
                      ? `${adInfo.announcer?.houses || 0} bien(s) immobilier(s)`
                      : `${adInfo.announcer?.furnitures || 0} mobilier(s)`}
                    {adInfo.announcer?.verified && (
                      <span className='ml-2 inline-flex items-center gap-1 text-emerald-500'>
                        <HiCheckCircle className='text-sm' />
                        Vérifié
                      </span>
                    )}
                  </p>
                </div>
                <div className='w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0 border-2 border-white shadow-md'>
                  {adInfo.announcer?.avatar ? (
                    <img
                      src={mediaUrl(adInfo.announcer.avatar)}
                      alt={adInfo.announcer.name}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    adInfo.announcer?.name?.charAt(0).toUpperCase() || 'A'
                  )}
                </div>
              </div>

              {/* Trust highlights */}
              <div className='py-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-100'>
                <div className='flex items-start gap-4'>
                  <div className='w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0'>
                    <MdVerifiedUser className='text-primary text-xl' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900 text-sm mb-0.5'>Annonce vérifiée</h4>
                    <p className='text-gray-400 text-sm leading-relaxed'>
                      Contrôlée et validée par l&apos;équipe Domilix.
                    </p>
                  </div>
                </div>
                {adInfo.announcer?.verified && (
                  <div className='flex items-start gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0'>
                      <HiCheckBadge className='text-primary text-xl' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900 text-sm mb-0.5'>Annonceur de confiance</h4>
                      <p className='text-gray-400 text-sm leading-relaxed'>
                        Parmi les annonceurs les plus fiables de la plateforme.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className='py-8 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  À propos de ce {isRealestate ? 'logement' : 'produit'}
                </h3>
                <p className='text-gray-500 leading-relaxed text-[15px]'>
                  {adInfo.description || 'Aucune description disponible pour cette annonce.'}
                </p>

                {/* Furniture dimensions */}
                {!isRealestate && (adInfo.height || adInfo.width || adInfo.length) && (
                  <div className='flex flex-wrap gap-3 mt-5'>
                    {[
                      { label: 'Hauteur', value: adInfo.height, unit: 'cm' },
                      { label: 'Largeur', value: adInfo.width, unit: 'cm' },
                      { label: 'Longueur', value: adInfo.length, unit: 'cm' },
                    ]
                      .filter(item => item.value)
                      .map(item => (
                        <div
                          key={item.label}
                          className='flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl'
                        >
                          <span className='text-base font-bold text-gray-900'>
                            {item.value} {item.unit}
                          </span>
                          <span className='text-xs text-gray-400 font-medium'>{item.label}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className='py-8 border-b border-gray-100'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-5'>
                    Équipements &amp; services
                  </h3>
                  <div className='flex flex-wrap gap-3'>
                    {amenities.map(item => (
                      <div
                        key={item.label}
                        className='flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-200 hover:bg-orange-50 transition-colors'
                      >
                        <span className='text-primary text-base'>{item.icon}</span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              <div className='py-8'>
                <h3 className='text-lg font-semibold text-gray-900 mb-1'>Localisation</h3>
                <p className='text-sm text-gray-400 mb-5'>
                  {[adInfo.city, adInfo.country].filter(Boolean).join(', ')}
                  {!adInfo.unlocked && (
                    <span className='ml-2 text-primary font-medium'>
                      · adresse exacte après déblocage
                    </span>
                  )}
                </p>
                <MapboxMap
                  address={adInfo.address}
                  isUnlocked={adInfo.unlocked}
                  latitude={adInfo.latitude}
                  longitude={adInfo.longitude}
                />
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className='lg:col-span-1'>
              <div className='sticky top-28 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden'>
                {/* Orange accent stripe */}
                <div className='h-1 bg-primary-gradient' />

                <div className='p-6'>
                  {/* Price */}
                  <div className='mb-6'>
                    <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-1'>
                      {isForRent ? 'Loyer mensuel' : 'Prix de vente'}
                    </p>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-3xl font-bold text-gray-900'>
                        {adInfo.price?.toLocaleString()}
                      </span>
                      <span className='text-gray-400 font-medium text-sm'>
                        {adInfo.devise || 'FCFA'}
                      </span>
                      {isForRent && (
                        <span className='text-gray-400 text-sm font-medium'>
                          / {adInfo.period || 'mois'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta pills */}
                  <div className='flex flex-wrap gap-2 mb-6'>
                    <span className='px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600'>
                      {isRealestate ? 'Immobilier' : 'Mobilier'}
                      {adInfo.category?.name && ` · ${adInfo.category.name}`}
                    </span>
                    {adInfo.city && (
                      <span className='flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600'>
                        <HiMapPin className='text-primary text-xs' />
                        {adInfo.city}
                      </span>
                    )}
                    {adInfo.caution ? (
                      <span className='px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-xs font-medium text-orange-700'>
                        Caution · {adInfo.caution.toLocaleString()} {adInfo.devise || 'FCFA'}
                      </span>
                    ) : null}
                  </div>

                  {/* Unlock CTA */}
                  {adInfo.unlocked ? (
                    <div className='bg-green-50 border border-green-200 rounded-2xl p-4 mb-4'>
                      <div className='flex items-center gap-2 text-green-700 font-bold text-sm mb-2'>
                        <HiCheckCircle className='text-xl' />
                        Annonce débloquée
                      </div>
                      {adInfo.exact_address && (
                        <p className='text-green-800 text-sm font-medium'>
                          {adInfo.exact_address}
                        </p>
                      )}
                      {adInfo.announcer?.contact && (
                        <a
                          href={`tel:${adInfo.announcer.contact}`}
                          className='block mt-2 text-green-700 font-black text-base hover:text-green-900'
                        >
                          {adInfo.announcer.contact}
                        </a>
                      )}
                      {adInfo.announcer?.email && (
                        <a
                          href={`mailto:${adInfo.announcer.email}`}
                          className='block mt-1 text-green-700 font-semibold text-sm hover:text-green-900'
                        >
                          {adInfo.announcer.email}
                        </a>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowUnlockDialog(true)}
                        className='w-full text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all mb-4 uppercase tracking-tight bg-primary-gradient'
                      >
                        Débloquer l'annonce
                      </button>
                      <div className='flex items-center justify-center gap-2 text-gray-400 text-xs font-bold mb-6 uppercase tracking-widest'>
                        <HiLockClosed className='text-sm' />
                        Accès sécurisé par Domicoins
                      </div>
                    </>
                  )}

                  {/* Divider */}
                  <div className='border-t border-gray-100 my-5' />

                  {/* Announcer mini-card */}
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-base overflow-hidden flex-shrink-0'>
                      {adInfo.announcer?.avatar ? (
                        <img
                          src={mediaUrl(adInfo.announcer.avatar)}
                          alt={adInfo.announcer.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        adInfo.announcer?.name?.charAt(0).toUpperCase() || 'A'
                      )}
                    </div>
                    <div className='min-w-0'>
                      <h5 className='font-semibold text-gray-900 text-sm truncate'>
                        {adInfo.announcer?.name || 'Annonceur'}
                      </h5>
                      {adInfo.announcer?.verified && (
                        <span className='inline-flex items-center gap-1 text-xs text-emerald-500 font-medium'>
                          <HiCheckCircle className='text-xs' />
                          Identité vérifiée
                        </span>
                      )}
                    </div>
                  </div>

                  {adInfo.announcer?.bio && (
                    <p className='text-xs text-gray-400 leading-relaxed mb-4'>
                      {adInfo.announcer.bio}
                    </p>
                  )}

                  <div className='grid grid-cols-2 gap-2 mb-5'>
                    <div className='text-center py-3 bg-gray-50 rounded-xl'>
                      <p className='text-lg font-bold text-gray-900'>{adInfo.announcer?.houses || 0}</p>
                      <p className='text-[11px] text-gray-400 font-medium'>Immobiliers</p>
                    </div>
                    <div className='text-center py-3 bg-gray-50 rounded-xl'>
                      <p className='text-lg font-bold text-gray-900'>{adInfo.announcer?.furnitures || 0}</p>
                      <p className='text-[11px] text-gray-400 font-medium'>Mobiliers</p>
                    </div>
                  </div>

                  {/* Secondary actions */}
                  <div className='space-y-2'>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className='w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors'
                    >
                      <HiOutlineShare className='text-base' />
                      Partager cette annonce
                    </button>
                    <button
                      onClick={() => setShowSignalDialog(true)}
                      className='w-full flex items-center justify-center gap-2 py-2.5 border border-red-100 rounded-xl text-red-400 font-medium text-sm hover:bg-red-50 transition-colors'
                    >
                      <HiExclamationTriangle className='text-base' />
                      Signaler un problème
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Similar listings ── */}
            {similarAds.length > 0 && (
              <section className='mt-16 pt-12 border-t border-gray-100'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>
                  Autres annonces
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                  {similarAds.map(a => (
                    <a key={a.id} href={`/houses/${a.id}`} className='group block'>
                      <div className='aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 relative'>
                        <div
                          className='absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500'
                          style={{
                            backgroundImage: a.medias?.[0]?.file
                              ? `url('${mediaUrl(a.medias[0].file)}')`
                              : undefined,
                          }}
                        />
                        <span className='absolute top-2 left-2 bg-gray-900/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide'>
                          {a.ad_type === 'location' ? 'Location' : 'Vente'}
                        </span>
                      </div>
                      <h4 className='font-semibold text-gray-900 text-sm truncate mb-0.5'>
                        {a.category?.name || 'Annonce'} · {a.city}
                      </h4>
                      <p className='text-gray-400 text-xs mb-1.5'>
                        {a.city}{a.country && `, ${a.country}`}
                      </p>
                      <p className='font-bold text-base text-primary'>
                        {a.price?.toLocaleString()}{' '}
                        <span className='font-medium text-gray-400 text-xs'>
                          {a.devise || 'FCFA'}
                          {a.ad_type === 'location' && ` / ${a.period || 'mois'}`}
                        </span>
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            )}
        </main>
      </div>

      {/* ── Modals ── */}
      {showModal && (
        <MediasDialog
          toggleModal={() => setShowModal(false)}
          medias={adInfo.medias || []}
          initialIndex={modalInitialIndex}
        />
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={`${adInfo.category?.name || 'Annonce'} · ${adInfo.city || 'Localisation'}`}
        price={`${adInfo.price?.toLocaleString()} ${adInfo.devise || 'FCFA'}`}
        location={adInfo.city || adInfo.address}
        image={mediaUrl(adInfo.medias?.[0]?.file)}
        type={adInfo.ad_type === 'location' ? 'Location' : 'Vente'}
      />

      <UnlockDialog
        isOpen={showUnlockDialog}
        onClose={() => setShowUnlockDialog(false)}
        onConfirm={handleUnlock}
        price={1}
        hasCredits={hasCredits}
      />

      <SignalDialog
        isOpen={showSignalDialog}
        onClose={() => setShowSignalDialog(false)}
        onSubmit={handleSignal}
      />

      <Footer2 />
    </>
  );
}
