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
import { useParams } from '@router';
import { getAd, getAds, unlockAd } from '@services/announceApi';
import { toggleLike } from '@services/favoritesApi';
import { signinDialogActions } from '@stores/defineStore';
import { mediaUrl } from '@utils/mediaUrl';

import { useAuth } from '../../hooks/useAuth';
import { Ad as AdType } from '../../utils/types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Ad(): React.ReactElement {
  const { id } = useParams();
  const adId = Array.isArray(id) ? id[0] : id;

  const [adInfo, setAdInfo] = useState<AdType | null>(null);
  const [similarAds, setSimilarAds] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showSignalDialog, setShowSignalDialog] = useState(false);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { isAuthenticated } = useAuth();

  const openModalWithImage = (index: number) => {
    setModalInitialIndex(index);
    setShowModal(true);
  };

  const handleUnlock = async () => {
    if (!adInfo) return;
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
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [adId]);

  if (loading) {
    return (
      <>
        <Nav2 />
        <div className='min-h-screen bg-white pt-20 flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-10 h-10 border-4 border-orange-100 border-t-primary rounded-full animate-spin mx-auto mb-4' />
            <p className='text-gray-400 text-sm font-medium'>Chargement de l&apos;annonce…</p>
          </div>
        </div>
      </>
    );
  }

  if (!adInfo) {
    return (
      <>
        <Nav2 />
        <div className='min-h-screen bg-white pt-20 flex items-center justify-center'>
          <p className='text-gray-500 font-medium'>Annonce introuvable.</p>
        </div>
      </>
    );
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
                <div
                  className='col-span-2 row-span-2 bg-cover bg-center cursor-pointer hover:brightness-95 transition-all duration-300 bg-gray-100'
                  style={{ backgroundImage: `url('${mediaUrl(adInfo.medias[0]?.file)}')` }}
                  onClick={() => openModalWithImage(0)}
                />
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className='bg-cover bg-center cursor-pointer hover:brightness-90 transition-all duration-300 bg-gray-100'
                    style={{
                      backgroundImage: adInfo.medias[i]
                        ? `url('${mediaUrl(adInfo.medias[i].file)}')`
                        : undefined,
                    }}
                    onClick={() => adInfo.medias[i] && openModalWithImage(i)}
                  />
                ))}
                <div
                  className='relative bg-cover bg-center cursor-pointer hover:brightness-90 transition-all duration-300 bg-gray-100'
                  style={{
                    backgroundImage: adInfo.medias[4]
                      ? `url('${mediaUrl(adInfo.medias[4].file)}')`
                      : undefined,
                  }}
                  onClick={() => openModalWithImage(0)}
                >
                  <button className='absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-gray-800 text-xs font-semibold border border-white/80 shadow-md flex items-center gap-1.5 hover:bg-white transition-colors'>
                    <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 10h16M4 14h16M4 18h16' />
                    </svg>
                    {adInfo.medias.length} photos
                  </button>
                </div>
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

                  {/* Unlock CTA or contact */}
                  {adInfo.unlocked ? (
                    <div className='bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4'>
                      <div className='flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-3'>
                        <HiCheckCircle className='text-base flex-shrink-0' />
                        Annonce débloquée
                      </div>
                      {adInfo.exact_address && (
                        <p className='text-emerald-800 text-sm font-medium mb-2'>
                          {adInfo.exact_address}
                        </p>
                      )}
                      {adInfo.announcer?.contact && (
                        <a
                          href={`tel:${adInfo.announcer.contact}`}
                          className='block text-emerald-700 font-bold text-base hover:text-emerald-900'
                        >
                          {adInfo.announcer.contact}
                        </a>
                      )}
                      {adInfo.announcer?.email && (
                        <a
                          href={`mailto:${adInfo.announcer.email}`}
                          className='block mt-1 text-emerald-600 text-sm font-medium hover:text-emerald-800'
                        >
                          {adInfo.announcer.email}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className='mb-4'>
                      <button
                        type='button'
                        onClick={() => setShowUnlockDialog(true)}
                        className='w-full text-white py-4 rounded-xl font-semibold text-base shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all bg-primary-gradient'
                      >
                        Débloquer l&apos;annonce
                      </button>
                      <p className='flex items-center justify-center gap-1.5 text-gray-400 text-xs font-medium mt-2'>
                        <HiLockClosed className='text-xs' />
                        Accès sécurisé via Domicoins
                      </p>
                    </div>
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
