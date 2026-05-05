'use client';

import { motion } from 'framer-motion';
import L from 'leaflet';
import React, { useEffect, useState } from 'react';
import {
  FaCar,
  FaCouch,
  FaDoorOpen,
  FaSwimmingPool,
  FaTree,
  FaUtensils,
  FaWifi,
} from 'react-icons/fa';
import {
  HiCheckCircle,
  HiChevronRight,
  HiExclamationTriangle,
  HiHeart,
  HiLockClosed,
  HiMapPin,
  HiOutlineHeart,
  HiOutlineShare,
} from 'react-icons/hi2';
import { MdAcUnit, MdSecurity, MdTv, MdVerifiedUser, MdWorkspacePremium } from 'react-icons/md';

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

// Fix default markers in react-leaflet
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [adId]);

  if (loading) {
    return (
      <>
        <Nav2 />
        <div className='min-h-screen bg-gray-50 pt-20 flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4' />
            <p className='text-gray-600 font-medium'>Chargement de l'annonce...</p>
          </div>
        </div>
      </>
    );
  }

  if (!adInfo) {
    return (
      <>
        <Nav2 />
        <div className='min-h-screen bg-gray-50 pt-20 flex items-center justify-center'>
          <p className='text-gray-600 text-lg font-medium'>Annonce non trouvée.</p>
        </div>
      </>
    );
  }

  const isRealestate = adInfo.type === 'realestate';
  const isForRent = adInfo.ad_type === 'location';
  const ad = adInfo as any; // for optional API fields not yet in the TS type

  return (
    <>
      <Nav2 />
      <div className='min-h-screen bg-[#FAFAFA] pt-20'>
        <main className='max-w-7xl mx-auto px-6 py-8'>

          {/* ── Breadcrumb + actions ── */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-2 text-sm text-gray-500 font-medium'>
              <span>{adInfo.country || 'Cameroun'}</span>
              <HiChevronRight />
              <span>{adInfo.city || 'Localisation'}</span>
              <HiChevronRight />
              <span className='text-gray-900 font-semibold'>
                {adInfo.category?.name || 'Annonce'}
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setShowShareModal(true)}
                className='flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-bold hover:border-orange-500 transition-colors'
              >
                <HiOutlineShare className='text-xl' />
                Partager
              </button>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-colors ${
                  liked
                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-orange-500'
                }`}
              >
                {liked ? (
                  <HiHeart className='text-xl text-orange-500' />
                ) : (
                  <HiOutlineHeart className='text-xl text-red-400' />
                )}
                {liked ? 'Sauvegardé' : 'Sauvegarder'}
              </button>
            </div>
          </div>

          {/* ── Title + badges + price ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8'
          >
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <span className='bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-200'>
                  {adInfo.category?.name || (isRealestate ? 'Immobilier' : 'Mobilier')}
                </span>
                {!adInfo.unlocked && (
                  <span className='bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1'>
                    <HiLockClosed className='text-xs' />
                    Accès par crédits
                  </span>
                )}
              </div>
              <h1 className='text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight'>
                {isRealestate ? 'Logement' : 'Meuble'}
                {adInfo.city && ` à ${adInfo.city}`}
                {adInfo.address && `, ${adInfo.address}`}
              </h1>
              <div className='flex flex-wrap items-center gap-4 text-gray-600'>
                {adInfo.announcer?.verified && (
                  <div className='flex items-center gap-1'>
                    <HiCheckCircle className='text-orange-500' />
                    <span className='font-semibold text-gray-900 text-sm'>Annonceur vérifié</span>
                  </div>
                )}
                <div className='flex items-center gap-1'>
                  <HiMapPin className='text-orange-500' />
                  <span className='font-medium text-sm'>
                    {adInfo.city || 'Localisation'}
                    {adInfo.country && `, ${adInfo.country}`}
                  </span>
                </div>
              </div>
            </div>
            <div className='flex flex-col items-start md:items-end flex-shrink-0'>
              <span className='text-sm font-bold text-gray-500 mb-1'>
                {isForRent ? 'Par mois' : 'Prix de vente'}
              </span>
              <span className='text-3xl font-black text-primary'>
                {adInfo.price?.toLocaleString()}{' '}
                <span className='text-base font-medium text-gray-400'>
                  {adInfo.devise || 'FCFA'}
                  {isForRent && adInfo.period && ` / ${adInfo.period}`}
                </span>
              </span>
            </div>
          </motion.div>

          {/* ── Gallery ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='grid grid-cols-4 grid-rows-2 gap-2 h-[380px] sm:h-[480px] lg:h-[550px] mb-12 rounded-2xl overflow-hidden shadow-xl'
          >
            {adInfo.medias && adInfo.medias.length > 0 ? (
              <>
                <div
                  className='col-span-2 row-span-2 bg-cover bg-center cursor-pointer hover:brightness-95 transition-all duration-500 bg-gray-200'
                  style={{ backgroundImage: `url('${mediaUrl(adInfo.medias[0]?.file)}')` }}
                  onClick={() => openModalWithImage(0)}
                />
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className='bg-cover bg-center cursor-pointer hover:brightness-90 transition-all duration-500 bg-gray-200'
                    style={{
                      backgroundImage: adInfo.medias[i]
                        ? `url('${mediaUrl(adInfo.medias[i].file)}')`
                        : undefined,
                    }}
                    onClick={() => adInfo.medias[i] && openModalWithImage(i)}
                  />
                ))}
                <div
                  className='relative bg-cover bg-center cursor-pointer hover:brightness-90 transition-all duration-500 bg-gray-200'
                  style={{
                    backgroundImage: adInfo.medias[4]
                      ? `url('${mediaUrl(adInfo.medias[4].file)}')`
                      : undefined,
                  }}
                  onClick={() => openModalWithImage(0)}
                >
                  <button className='absolute bottom-4 right-4 bg-white px-4 py-2.5 rounded-xl text-gray-900 text-sm font-black border border-gray-200 shadow-xl flex items-center gap-2 hover:bg-gray-50 transition-colors'>
                    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 6h16M4 10h16M4 14h16M4 18h16'
                      />
                    </svg>
                    Galerie ({adInfo.medias.length})
                  </button>
                </div>
              </>
            ) : (
              <div className='col-span-4 row-span-2 flex items-center justify-center bg-gray-100 rounded-2xl'>
                <div className='text-center'>
                  <div className='text-gray-400 text-5xl mb-4'>📷</div>
                  <p className='text-gray-500 text-lg font-medium'>Aucune image disponible</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Content grid: 2/3 + 1/3 ── */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-16 relative'>

            {/* ── Left: main content ── */}
            <div className='lg:col-span-2'>

              {/* Host */}
              <div className='flex items-center justify-between pb-8 border-b border-gray-200'>
                <div>
                  <h2 className='text-2xl font-black text-gray-900 mb-1'>
                    Proposé par {adInfo.announcer?.name || 'Annonceur'}
                  </h2>
                  <p className='text-gray-500 font-medium text-sm'>
                    {adInfo.announcer?.verified ? 'Annonceur vérifié' : 'Annonceur'}
                    {isRealestate
                      ? ` • ${adInfo.announcer?.houses || 0} bien(s) immobilier(s)`
                      : ` • ${adInfo.announcer?.furnitures || 0} mobilier(s)`}
                  </p>
                </div>
                <div className='w-16 h-16 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-black text-xl overflow-hidden flex-shrink-0'>
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

              {/* Highlights */}
              <div className='py-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-200'>
                {adInfo.announcer?.verified && (
                  <div className='flex items-start gap-4'>
                    <MdWorkspacePremium className='text-orange-500 text-4xl flex-shrink-0' />
                    <div>
                      <h4 className='font-black text-gray-900 mb-1'>Annonceur très bien noté</h4>
                      <p className='text-gray-500 text-sm leading-relaxed'>
                        Cet annonceur fait partie des plus fiables de la plateforme.
                      </p>
                    </div>
                  </div>
                )}
                <div className='flex items-start gap-4'>
                  <MdVerifiedUser className='text-orange-500 text-4xl flex-shrink-0' />
                  <div>
                    <h4 className='font-black text-gray-900 mb-1'>Annonce vérifiée</h4>
                    <p className='text-gray-500 text-sm leading-relaxed'>
                      Cette annonce a été contrôlée par l'équipe Domilix.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className='py-10 border-b border-gray-200'>
                <h3 className='text-xl font-black text-gray-900 mb-4'>
                  À propos de ce {isRealestate ? 'logement' : 'produit'}
                </h3>
                <p className='text-gray-600 leading-relaxed font-medium'>
                  {adInfo.description || 'Aucune description disponible pour cette annonce.'}
                </p>

                {isRealestate && (
                  <div className='grid grid-cols-3 gap-4 mt-6'>
                    {[
                      { label: 'Chambres', value: adInfo.bedroom },
                      { label: 'Salles de bain', value: adInfo.toilet },
                      { label: 'Salons', value: adInfo.mainroom },
                    ]
                      .filter(item => item.value)
                      .map(item => (
                        <div
                          key={item.label}
                          className='text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm'
                        >
                          <div className='text-2xl font-black text-gray-900'>{item.value}</div>
                          <div className='text-sm text-gray-500 font-medium'>{item.label}</div>
                        </div>
                      ))}
                  </div>
                )}

                {!isRealestate && (adInfo.height || adInfo.width || adInfo.length) && (
                  <div className='grid grid-cols-3 gap-4 mt-6'>
                    {[
                      { label: 'Hauteur', value: adInfo.height, unit: 'cm' },
                      { label: 'Largeur', value: adInfo.width, unit: 'cm' },
                      { label: 'Longueur', value: adInfo.length, unit: 'cm' },
                    ]
                      .filter(item => item.value)
                      .map(item => (
                        <div
                          key={item.label}
                          className='text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm'
                        >
                          <div className='text-xl font-black text-gray-900'>
                            {item.value} {item.unit}
                          </div>
                          <div className='text-sm text-gray-500 font-medium'>{item.label}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className='py-10 border-b border-gray-200'>
                <h3 className='text-xl font-black text-gray-900 mb-6'>
                  Ce que propose ce {isRealestate ? 'logement' : 'produit'}
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-12'>
                  {isRealestate && adInfo.wifi ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <FaWifi className='text-orange-500 text-xl flex-shrink-0' />
                      <span>WiFi inclus</span>
                    </div>
                  ) : null}
                  {isRealestate && adInfo.air_conditioning ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <MdAcUnit className='text-orange-500 text-xl flex-shrink-0' />
                      <span>Climatisation</span>
                    </div>
                  ) : null}
                  {isRealestate && adInfo.security_24h ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <MdSecurity className='text-orange-500 text-xl flex-shrink-0' />
                      <span>Sécurité 24h/24</span>
                    </div>
                  ) : null}
                  {isRealestate && adInfo.equipped_kitchen ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <FaUtensils className='text-orange-500 text-xl flex-shrink-0' />
                      <span>Cuisine équipée</span>
                    </div>
                  ) : null}
                  {isRealestate && adInfo.smart_tv ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <MdTv className='text-orange-500 text-xl flex-shrink-0' />
                      <span>Smart TV</span>
                    </div>
                  ) : null}
                  {isRealestate && adInfo.pool ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <FaSwimmingPool className='text-orange-500 text-xl flex-shrink-0' />
                      <span>Piscine</span>
                    </div>
                  ) : null}
                  {isRealestate && adInfo.gate ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <FaDoorOpen className='text-orange-500 text-xl flex-shrink-0' />
                      <span>Portail sécurisé</span>
                    </div>
                  ) : null}
                  {isRealestate && adInfo.garden ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <FaTree className='text-orange-500 text-xl flex-shrink-0' />
                      <span>Jardin</span>
                    </div>
                  ) : null}
                  {ad.garage ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <FaCar className='text-orange-500 text-xl flex-shrink-0' />
                      <span>Parking / Garage</span>
                    </div>
                  ) : null}
                  {isRealestate && ad.furnitured ? (
                    <div className='flex items-center gap-4 text-gray-700 font-semibold'>
                      <FaCouch className='text-orange-500 text-xl flex-shrink-0' />
                      <span>Meublé</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Map */}
              <div className='py-10'>
                <h3 className='text-xl font-black text-gray-900 mb-2'>Localisation</h3>
                <p className='text-gray-500 font-medium mb-6'>
                  {adInfo.city || ''}
                  {adInfo.country && `, ${adInfo.country}`}
                  {!adInfo.unlocked && (
                    <span className='ml-2 text-sm font-bold text-primary'>
                      — adresse exacte après déblocage
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
              <div className='sticky top-28 bg-white border-2 border-gray-900 rounded-[2rem] shadow-2xl p-8 overflow-hidden'>
                <div className='absolute top-0 right-0 w-32 h-32 bg-orange-50 -mr-16 -mt-16 rounded-full pointer-events-none' />

                {/* Price */}
                <div className='flex items-baseline justify-between mb-8'>
                  <div>
                    <span className='text-3xl font-black text-gray-900'>
                      {adInfo.price?.toLocaleString()}
                    </span>
                    <span className='text-gray-500 font-bold ml-1 text-sm'>
                      {adInfo.devise || 'FCFA'}
                    </span>
                    {isForRent && (
                      <span className='text-gray-400 text-sm font-bold ml-1'>
                        / {adInfo.period || 'mois'}
                      </span>
                    )}
                  </div>
                  <span className='text-xs font-black bg-orange-100 text-orange-600 px-2 py-1 rounded-lg uppercase tracking-wide'>
                    {isForRent ? 'Location' : 'Vente'}
                  </span>
                </div>

                {/* Meta info */}
                <div className='border-2 border-gray-100 rounded-2xl mb-6 divide-y-2 divide-gray-100'>
                  <div className='p-4'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1'>
                      Type
                    </p>
                    <p className='text-sm font-bold text-gray-900'>
                      {isRealestate ? 'Immobilier' : 'Mobilier'}
                      {adInfo.category?.name && ` • ${adInfo.category.name}`}
                    </p>
                  </div>
                  <div className='p-4'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1'>
                      Localisation
                    </p>
                    <p className='text-sm font-bold text-gray-900'>
                      {adInfo.city || 'Non précisée'}
                      {adInfo.country && `, ${adInfo.country}`}
                    </p>
                  </div>
                  {adInfo.caution ? (
                    <div className='p-4'>
                      <p className='text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1'>
                        Caution
                      </p>
                      <p className='text-sm font-bold text-gray-900'>
                        {adInfo.caution.toLocaleString()} {adInfo.devise || 'FCFA'}
                      </p>
                    </div>
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

                {/* Announcer info */}
                <div className='border-t border-gray-100 pt-6 space-y-4'>
                  <h4 className='font-black text-gray-900'>L'annonceur</h4>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-black text-lg overflow-hidden flex-shrink-0'>
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
                    <div>
                      <h5 className='font-black text-gray-900'>
                        {adInfo.announcer?.name || 'Annonceur'}
                      </h5>
                      {adInfo.announcer?.verified && (
                        <div className='flex items-center gap-1 text-sm text-green-600 font-semibold'>
                          <HiCheckCircle />
                          Compte vérifié
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='text-center p-3 bg-gray-50 rounded-xl'>
                      <div className='text-xl font-black text-gray-900'>
                        {adInfo.announcer?.houses || 0}
                      </div>
                      <div className='text-xs text-gray-500 font-bold'>Immobiliers</div>
                    </div>
                    <div className='text-center p-3 bg-gray-50 rounded-xl'>
                      <div className='text-xl font-black text-gray-900'>
                        {adInfo.announcer?.furnitures || 0}
                      </div>
                      <div className='text-xs text-gray-500 font-bold'>Mobiliers</div>
                    </div>
                  </div>
                  {adInfo.announcer?.bio && (
                    <p className='text-sm text-gray-600 font-medium leading-relaxed'>
                      {adInfo.announcer.bio}
                    </p>
                  )}
                </div>

                {/* Secondary actions */}
                <div className='border-t border-gray-100 pt-4 mt-4 space-y-3'>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className='w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors'
                  >
                    <HiOutlineShare className='text-lg' />
                    Partager cette annonce
                  </button>
                  <button
                    onClick={() => setShowSignalDialog(true)}
                    className='w-full flex items-center justify-center gap-2 py-3 border border-red-100 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 transition-colors'
                  >
                    <HiExclamationTriangle className='text-lg' />
                    Signaler un problème
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Similar listings ── */}
          {similarAds.length > 0 && (
            <section className='mt-8 py-16 border-t border-gray-200'>
              <h2 className='text-3xl font-black text-gray-900 mb-10 tracking-tight'>
                Annonces similaires
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                {similarAds.map(ad => (
                  <a key={ad.id} href={`/houses/${ad.id}`} className='group cursor-pointer block'>
                    <div className='aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100 relative shadow-lg'>
                      <div
                        className='absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700'
                        style={{
                          backgroundImage: ad.medias?.[0]?.file
                            ? `url('${mediaUrl(ad.medias[0].file)}')`
                            : undefined,
                        }}
                      />
                      <span className='absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest'>
                        {ad.ad_type === 'location' ? 'Location' : 'Vente'}
                      </span>
                    </div>
                    <div className='flex justify-between items-start mb-1'>
                      <h4 className='font-black text-gray-900 truncate pr-2'>
                        {ad.category?.name || 'Annonce'} • {ad.city}
                      </h4>
                    </div>
                    <p className='text-gray-500 text-sm font-semibold'>
                      {ad.city}
                      {ad.country && `, ${ad.country}`}
                    </p>
                    <p className='mt-2 font-black text-lg text-primary'>
                      {ad.price?.toLocaleString()}{' '}
                      <span className='font-bold text-gray-400 text-xs'>
                        {ad.devise || 'FCFA'}
                        {ad.ad_type === 'location' && ` / ${ad.period || 'mois'}`}
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
        title={`${adInfo.category?.name || 'Annonce'} • ${adInfo.city || 'Localisation'}`}
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
