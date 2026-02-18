import MediasDialog from '@components/MediasDialog/MediasDialog';
import Footer2 from '@components/Footer2/Footer2';
import Nav2 from '@components/Nav2/Nav2';
import { getAd, unlockAd } from '@services/announceApi';
import { toggleLike } from '@services/favoritesApi';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  FaBed,
  FaMapMarkerAlt,
  FaShower,
  FaUser,
  FaWifi,
  FaCar,
  FaSwimmingPool,
  FaUtensils,
  FaCouch,
  FaBath,
  FaDoorOpen,
  FaTree,
} from 'react-icons/fa';
import {
  HiLockClosed,
  HiOutlineHeart,
  HiOutlineShare,
  HiExclamationTriangle,
  HiCheckCircle,
  HiXCircle,
  HiCalendar,
  HiUsers,
  HiHome,
} from 'react-icons/hi2';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import { useParams } from 'react-router-dom';
import { Ad as AdType } from '../../utils/types';
import ShareModal from '@components/ShareModal/ShareModal';
import UnlockDialog from '@components/UnlockDialog/UnlockDialog';
import SignalDialog from '@components/SignalDialog/SignalDialog';
import MapboxMap from '@components/MapboxMap/MapboxMap';
import { useAuth } from '../../hooks/useAuth';
import { signinDialogActions } from '@stores/defineStore';

export default function Ad(): React.ReactElement {
  const { id } = useParams();
  const [adInfo, setAdInfo] = useState<AdType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showSignalDialog, setShowSignalDialog] = useState(false);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { isAuthenticated } = useAuth();

  const toggleModal = () => setShowModal(!showModal);

  const openModalWithImage = (index: number) => {
    setModalInitialIndex(index);
    setShowModal(true);
  };

  const handleUnlock = async () => {
    if (!adInfo) return;

    try {
      const result = await unlockAd(adInfo.id);
      console.log('Annonce débloquée:', result);
      // Recharger les données de l'annonce pour voir les informations débloquées
      const updatedAd = await getAd(adInfo.id);
      setAdInfo(updatedAd);
      setShowUnlockDialog(false);
    } catch (error) {
      console.error('Erreur lors du déblocage:', error);
      // Vous pouvez ajouter une notification d'erreur ici
    }
  };

  const handleSignal = (reason: string, details: string) => {
    console.log('Signalement:', { reason, details });
  };

  const handleLike = async () => {
    if (isLiking) return;

    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      signinDialogActions.toggle();
      return;
    }

    try {
      setIsLiking(true);
      const response = await toggleLike(adInfo!.id);
      setLiked(response.liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      getAd(parseInt(id))
        .then(ad => {
          setAdInfo(ad);
          setLiked(ad.liked || false);
        })
        .catch(error => {
          console.error('Error fetching ad:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Nav2 />
        <div className='min-h-screen bg-gray-50 pt-16 flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-gray-600'>Chargement de l'annonce...</p>
          </div>
        </div>
      </>
    );
  }

  if (!adInfo) {
    return (
      <>
        <Nav2 />
        <div className='min-h-screen bg-gray-50 pt-16 flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-gray-600 text-lg'>Annonce non trouvée</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav2 />
      <div className='min-h-screen bg-white pt-16'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          {/* En-tête avec breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            {/* Breadcrumb */}
            <nav className='flex items-center space-x-2 text-sm text-gray-500 mb-4'>
              <span>Accueil</span>
              <span>•</span>
              <span>{adInfo.category?.name}</span>
              <span>•</span>
              <span className='text-gray-900 font-medium'>
                {adInfo.city || 'Localisation'}
              </span>
            </nav>

            {/* Titre principal */}
            <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
              <div className='space-y-3 flex-1'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                  {adInfo.category?.name} • {adInfo.city || 'Localisation'}
                </h1>
                <div className='flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600'>
                  <span className='flex items-center'>
                    <HiHome className='mr-1' />
                    {adInfo.type === 'realestate'
                      ? 'Logement entier'
                      : 'Mobilier'}
                  </span>
                  <span className='hidden sm:inline'>•</span>
                  <span className='flex items-center'>
                    <HiUsers className='mr-1' />
                    {adInfo.bedroom || 1}{' '}
                    {adInfo.bedroom! > 1 ? 'chambres' : 'chambre'}
                  </span>
                  {adInfo.toilet && (
                    <>
                      <span className='hidden sm:inline'>•</span>
                      <span>
                        {adInfo.toilet} salle{adInfo.toilet > 1 ? 's' : ''} de
                        bain
                      </span>
                    </>
                  )}
                </div>

                {/* Badges de vérification */}
                <div className='flex flex-wrap items-center gap-2 sm:gap-4'>
                  {adInfo.announcer?.verified && (
                    <div className='flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs sm:text-sm'>
                      <HiCheckCircle className='w-4 h-4' />
                      <span className='font-medium'>Annonceur vérifié</span>
                    </div>
                  )}

                  <div className='flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm'>
                    <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                    <span className='font-medium'>Annonce active</span>
                  </div>

                  <div className='flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm'>
                    <FaMapMarkerAlt className='w-3 h-3' />
                    <span className='font-medium hidden sm:inline'>Localisation disponible</span>
                    <span className='font-medium sm:hidden'>Localisation</span>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2 sm:gap-3 flex-shrink-0'>
                <button
                  onClick={() => setShowShareModal(true)}
                  className='flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors text-sm'
                >
                  <HiOutlineShare className='w-4 h-4' />
                  <span className='font-medium hidden sm:inline'>Partager</span>
                </button>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm ${
                    liked
                      ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <HiOutlineHeart
                    className={`w-4 h-4 ${liked ? 'fill-current' : ''}`}
                  />
                  <span className='font-medium hidden sm:inline'>
                    {liked ? 'Aimé' : 'Aimer'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Galerie d'images moderne */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='relative rounded-2xl overflow-hidden mb-8'
          >
            {adInfo.medias && adInfo.medias.length > 0 ? (
              <div className='grid h-[300px] sm:h-[400px] lg:h-[480px] grid-cols-2 sm:grid-cols-4 gap-2'>
                {/* Image principale */}
                <div className='col-span-2 row-span-2 relative sm:rounded-l-2xl overflow-hidden cursor-pointer hover:brightness-95 transition-all'>
                  <img
                    src={
                      'http://localhost:8000' + adInfo.medias[0]?.file ||
                      'https://via.placeholder.com/732x580'
                    }
                    alt='Image principale'
                    className='w-full h-full object-cover'
                    onClick={() => openModalWithImage(0)}
                  />
                </div>

                {/* Images secondaires */}
                {/* <div className='col-span-2 h-full grid grid-cols-2 gap-2'> */}
                {adInfo.medias.slice(1, 5).map((media, index) => (
                  <div
                    key={media.id}
                    className={`relative overflow-hidden cursor-pointer hover:brightness-95 transition-all ${
                      index === 1 ? 'rounded-tr-2xl' : ''
                    } ${index === 3 ? 'rounded-br-2xl' : ''}`}
                  >
                    <img
                      src={
                        'http://localhost:8000' + media.file ||
                        `https://via.placeholder.com/366x290`
                      }
                      alt={`Image ${index + 2}`}
                      className='w-full h-full object-cover'
                      onClick={() => openModalWithImage(index + 1)}
                    />
                    {/* Overlay pour la dernière image si plus de 5 photos */}
                    {index === 3 && adInfo.medias.length > 5 && (
                      <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                        <span className='text-white font-semibold text-lg'>
                          +{adInfo.medias.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Remplir les espaces vides */}
                {Array.from({
                  length: Math.max(0, 4 - (adInfo.medias.length - 1)),
                }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className='relative h-full overflow-hidden bg-gray-200 flex items-center justify-center'
                  >
                    <span className='text-gray-400 text-sm'>Pas d'image</span>
                  </div>
                ))}
                {/* </div> */}
              </div>
            ) : (
              <div className='h-[480px] flex items-center justify-center bg-gray-100 rounded-2xl'>
                <div className='text-center'>
                  <div className='text-gray-400 text-4xl mb-4'>📷</div>
                  <p className='text-gray-500 text-lg'>
                    Aucune image disponible
                  </p>
                </div>
              </div>
            )}

            {/* Bouton pour voir toutes les photos */}
            {adInfo.medias && adInfo.medias.length > 0 && (
              <button
                onClick={() => openModalWithImage(0)}
                className='absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all border border-gray-200'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <span className='hidden sm:inline'>Afficher toutes les photos</span>
                <span className='sm:hidden'>Photos</span>
              </button>
            )}
          </motion.div>

          {/* Contenu principal */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Informations principales */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Informations sur l'hôte */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='pb-8 border-b border-gray-200'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
                      {adInfo.type === 'realestate'
                        ? 'Logement entier'
                        : 'Article'}{' '}
                      proposé par {adInfo.announcer?.name || 'Annonceur'}
                    </h2>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <span>
                        {adInfo.bedroom || 1}{' '}
                        {adInfo.bedroom > 1 ? 'chambres' : 'chambre'}
                      </span>
                      {adInfo.toilet && (
                        <>
                          <span>•</span>
                          <span>
                            {adInfo.toilet} salle{adInfo.toilet > 1 ? 's' : ''}{' '}
                            de bain
                          </span>
                        </>
                      )}
                      {adInfo.mainroom && (
                        <>
                          <span>•</span>
                          <span>
                            {adInfo.mainroom} salon
                            {adInfo.mainroom > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg'>
                      {adInfo.announcer?.name
                        ? adInfo.announcer.name.charAt(0).toUpperCase()
                        : 'A'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Ce que propose ce logement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='pb-8 border-b border-gray-200'
              >
                <h3 className='text-2xl font-semibold text-gray-900 mb-6'>
                  Ce que propose ce{' '}
                  {adInfo.type === 'realestate' ? 'logement' : 'produit'}
                </h3>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                  {/* Équipements de base */}
                  <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                    <FaUtensils className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0' />
                    <span className='text-gray-900 text-sm sm:text-base'>Cuisine</span>
                  </div>

                  <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                    <FaWifi className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0' />
                    <span className='text-gray-900 text-sm sm:text-base'>Wifi</span>
                  </div>

                  {adInfo.type === 'realestate' && (
                    <>
                      {adInfo.furnitured && (
                        <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                          <FaCouch className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0' />
                          <span className='text-gray-900 text-sm sm:text-base'>Meublé</span>
                        </div>
                      )}

                      {adInfo.pool && (
                        <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                          <FaSwimmingPool className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0' />
                          <span className='text-gray-900 text-sm sm:text-base'>Piscine</span>
                        </div>
                      )}

                      {adInfo.garage && (
                        <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                          <FaCar className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0' />
                          <span className='text-gray-900 text-sm sm:text-base'>Garage</span>
                        </div>
                      )}

                      {adInfo.gate && (
                        <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                          <FaDoorOpen className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0' />
                          <span className='text-gray-900 text-sm sm:text-base'>
                            Portail sécurisé
                          </span>
                        </div>
                      )}

                      {adInfo.garden && (
                        <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                          <FaTree className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0' />
                          <span className='text-gray-900 text-sm sm:text-base'>Jardin</span>
                        </div>
                      )}

                      <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                        <FaBath className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0' />
                        <span className='text-gray-900 text-sm sm:text-base'>
                          <span className='hidden sm:inline'>Sèche-linge (Gratuit) dans le logement</span>
                          <span className='sm:hidden'>Sèche-linge</span>
                        </span>
                      </div>

                      <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                        <svg
                          className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                          />
                        </svg>
                        <span className='text-gray-900 text-sm sm:text-base'>
                          Espace de travail dédié
                        </span>
                      </div>

                      <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3'>
                        <svg
                          className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                          />
                        </svg>
                        <span className='text-gray-900 text-sm sm:text-base'>
                          <span className='hidden sm:inline'>Serrure ou verrou sur la porte de la chambre</span>
                          <span className='sm:hidden'>Serrure chambre</span>
                        </span>
                      </div>
                    </>
                  )}

                  {/* Équipements barrés (non disponibles) */}
                  <div className='flex items-center gap-3 sm:gap-4 py-2 sm:py-3 opacity-50'>
                    <svg
                      className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728'
                      />
                    </svg>
                    <span className='text-gray-400 line-through text-sm sm:text-base'>
                      <span className='hidden sm:inline'>Détecteur de monoxyde de carbone</span>
                      <span className='sm:hidden'>Détecteur CO</span>
                    </span>
                  </div>
                </div>

                <button className='mt-6 px-4 sm:px-6 py-2 sm:py-3 border border-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto'>
                  <span className='hidden sm:inline'>Afficher les{' '}
                  {adInfo.type === 'realestate'
                    ? '43 équipements'
                    : 'caractéristiques'}</span>
                  <span className='sm:hidden'>Voir tout</span>
                </button>
              </motion.div>

              {adInfo.type === 'realestate' && (
                <div className='grid grid-cols-3 gap-2 sm:gap-4 mb-6'>
                  {[
                    {
                      icon: FaBed,
                      value: adInfo.bedroom || 'N/A',
                      label: 'Chambres',
                    },
                    {
                      icon: FaShower,
                      value: adInfo.toilet || 'N/A',
                      label: 'Toilettes',
                    },
                    {
                      icon: FaMapMarkerAlt,
                      value: adInfo.mainroom || 'N/A',
                      label: 'Salons',
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className='text-center p-3 sm:p-4 bg-gray-50 rounded-lg'
                    >
                      <item.icon className='w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 sm:mb-2 text-orange-500' />
                      <div className='text-base sm:text-lg font-semibold text-gray-900'>
                        {item.value}
                      </div>
                      <div className='text-xs sm:text-sm text-gray-600'>{item.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {adInfo.type === 'furniture' && (
                <div className='grid grid-cols-3 gap-2 sm:gap-4 mb-6'>
                  {[
                    {
                      label: 'Hauteur',
                      value: `${adInfo.height || 'N/A'} cm`,
                    },
                    {
                      label: 'Largeur',
                      value: `${adInfo.width || 'N/A'} cm`,
                    },
                    {
                      label: 'Longueur',
                      value: `${adInfo.length || 'N/A'} cm`,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className='text-center p-3 sm:p-4 bg-gray-50 rounded-lg'
                    >
                      <div className='text-base sm:text-lg font-semibold text-gray-900'>
                        {item.value}
                      </div>
                      <div className='text-xs sm:text-sm text-gray-600'>{item.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='pb-8 border-b border-gray-200'
              >
                <h3 className='text-xl sm:text-2xl font-semibold text-gray-900 mb-4'>
                  À propos de ce{' '}
                  {adInfo.type === 'realestate' ? 'logement' : 'produit'}
                </h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-700 leading-relaxed text-base sm:text-lg'>
                    {adInfo.description ||
                      'Aucune description disponible pour cette annonce.'}
                  </p>
                </div>
              </motion.div>

              {/* Informations sur le logement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='pb-8 border-b border-gray-200'
              >
                <h3 className='text-xl sm:text-2xl font-semibold text-gray-900 mb-6'>
                  {adInfo.type === 'realestate'
                    ? 'Chambre dans appartement en résidence'
                    : 'Caractéristiques du produit'}
                </h3>

                {adInfo.type === 'realestate' ? (
                  <div className='space-y-4'>
                    <div className='flex items-start gap-4'>
                      <HiHome className='w-6 h-6 text-gray-600 mt-1' />
                      <div>
                        <h4 className='font-semibold text-gray-900'>
                          Chambre dans appartement en résidence
                        </h4>
                        <p className='text-gray-600 mt-1'>
                          Votre chambre privée dans un logement, avec accès à
                          des espaces partagés.
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-4'>
                      <HiCalendar className='w-6 h-6 text-gray-600 mt-1' />
                      <div>
                        <h4 className='font-semibold text-gray-900'>
                          Annulation gratuite avant le 26 février
                        </h4>
                        <p className='text-gray-600 mt-1'>
                          Obtenez un remboursement intégral si vous changez
                          d'avis.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                    {adInfo.height && (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <span className='text-gray-600 font-semibold text-sm sm:text-base'>H</span>
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900 text-sm sm:text-base'>Hauteur</p>
                          <p className='text-gray-600 text-sm'>{adInfo.height} cm</p>
                        </div>
                      </div>
                    )}

                    {adInfo.width && (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <span className='text-gray-600 font-semibold text-sm sm:text-base'>L</span>
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900 text-sm sm:text-base'>Largeur</p>
                          <p className='text-gray-600 text-sm'>{adInfo.width} cm</p>
                        </div>
                      </div>
                    )}

                    {adInfo.length && (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <span className='text-gray-600 font-semibold text-sm sm:text-base'>P</span>
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900 text-sm sm:text-base'>
                            Profondeur
                          </p>
                          <p className='text-gray-600 text-sm'>{adInfo.length} cm</p>
                        </div>
                      </div>
                    )}

                    {adInfo.weight && (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <span className='text-gray-600 font-semibold text-sm sm:text-base'>
                            ⚖
                          </span>
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900 text-sm sm:text-base'>Poids</p>
                          <p className='text-gray-600 text-sm'>{adInfo.weight} kg</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              <MapboxMap
                address={adInfo.address}
                isUnlocked={adInfo.unlocked}
                latitude={adInfo.latitude}
                longitude={adInfo.longitude}
              />
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Carte de prix et contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 lg:sticky lg:top-24'
              >
                {/* Prix principal */}
                <div className='text-center mb-6'>
                  <div className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>
                    {adInfo.price?.toLocaleString()}{' '}
                    <span className='text-orange-500 text-xl sm:text-2xl'>
                      {adInfo.devise || 'FCFA'}
                    </span>
                  </div>
                  {adInfo.ad_type === 'location' && (
                    <p className='text-gray-600'>
                      par {adInfo.period || 'mois'}
                    </p>
                  )}
                  <div className='inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mt-2'>
                    {adInfo.ad_type === 'location' ? 'À louer' : 'À vendre'}
                  </div>
                </div>

                {/* Informations importantes */}
                <div className='bg-orange-50 rounded-lg p-4 mb-6'>
                  <div className='flex items-center gap-2 mb-2'>
                    <HiLockClosed className='w-5 h-5 text-orange-600' />
                    <span className='font-semibold text-orange-800'>
                      Informations protégées
                    </span>
                  </div>
                  <p className='text-sm text-orange-700'>
                    Débloquez cette annonce pour voir les coordonnées de
                    l'annonceur et la localisation exacte.
                  </p>
                </div>

                {/* Bouton principal de déblocage */}
                <button
                  onClick={() => setShowUnlockDialog(true)}
                  className='w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] mb-4 shadow-lg'
                >
                  <span>Débloquer l'annonce</span>
                </button>

                <p className='text-center text-sm text-gray-600 mb-6'>
                  Utilisez vos Domicoins pour accéder aux informations complètes
                </p>

                {/* Informations sur l'annonceur */}
                <div className='border-t border-gray-100 pt-6'>
                  <h4 className='font-semibold text-gray-900 mb-4'>
                    À propos de l'annonceur
                  </h4>

                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg'>
                      {adInfo.announcer?.name
                        ? adInfo.announcer.name.charAt(0).toUpperCase()
                        : 'A'}
                    </div>
                    <div>
                      <h5 className='font-semibold text-gray-900'>
                        {adInfo.announcer?.name || 'Annonceur'}
                      </h5>
                      {adInfo.announcer?.verified && (
                        <div className='flex items-center gap-1 text-sm text-green-600'>
                          <HiCheckCircle className='w-4 h-4' />
                          <span>Compte vérifié</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <div className='text-center p-3 bg-gray-50 rounded-lg'>
                      <div className='text-lg font-semibold text-gray-900'>
                        {adInfo.announcer?.houses || 0}
                      </div>
                      <div className='text-sm text-gray-600'>Immobiliers</div>
                    </div>
                    <div className='text-center p-3 bg-gray-50 rounded-lg'>
                      <div className='text-lg font-semibold text-gray-900'>
                        {adInfo.announcer?.furnitures || 0}
                      </div>
                      <div className='text-sm text-gray-600'>Mobiliers</div>
                    </div>
                  </div>

                  {adInfo.announcer?.bio && (
                    <p className='text-sm text-gray-600 mb-4'>
                      {adInfo.announcer.bio}
                    </p>
                  )}
                </div>

                {/* Actions secondaires */}
                <div className='border-t border-gray-100 pt-4 space-y-3'>
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`w-full flex items-center justify-center gap-2 py-3 border rounded-lg transition-colors ${
                      liked
                        ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <HiOutlineHeart
                      className={`w-4 h-4 ${liked ? 'fill-current' : ''}`}
                    />
                    <span className='font-medium'>
                      {liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowShareModal(true)}
                    className='w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
                  >
                    <HiOutlineShare className='w-4 h-4' />
                    <span className='font-medium'>Partager cette annonce</span>
                  </button>

                  <button
                    onClick={() => setShowSignalDialog(true)}
                    className='w-full flex items-center justify-center gap-2 py-3 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors'
                  >
                    <HiExclamationTriangle className='w-4 h-4' />
                    <span className='font-medium'>Signaler un problème</span>
                  </button>
                </div>
              </motion.div>

              {/* Informations supplémentaires */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'
              >
                <h4 className='font-semibold text-gray-900 mb-4'>
                  Informations de l'annonce
                </h4>

                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Référence</span>
                    <span className='font-medium'>#{adInfo.id}</span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Publié le</span>
                    <span className='font-medium'>
                      {new Date(adInfo.creation_date).toLocaleDateString(
                        'fr-FR'
                      )}
                    </span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Photos</span>
                    <span className='font-medium'>
                      {adInfo.medias?.length || 0}
                    </span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Catégorie</span>
                    <span className='font-medium'>
                      {adInfo.category?.name || 'Non spécifiée'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <MediasDialog
          toggleModal={toggleModal}
          medias={adInfo.medias || []}
          initialIndex={modalInitialIndex}
        />
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={window.location.href}
        title={`${adInfo?.category?.name || 'Annonce'} • ${adInfo?.city || 'Localisation'}`}
        price={`${adInfo?.price?.toLocaleString()} ${adInfo?.devise || 'FCFA'}`}
        location={adInfo?.city || adInfo?.address}
        image={adInfo?.medias?.[0]?.file ? `http://localhost:8000${adInfo.medias[0].file}` : undefined}
        type={adInfo?.ad_type === 'location' ? 'Location' : 'Vente'}
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
