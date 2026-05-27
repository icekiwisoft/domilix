import Cover from '@assets/bg_img/cover_annonceur.jpg';
import Domilix from '@assets/domilix_icon.png';
import AnnouncerAdCard from '@components/AnnouncerAdCard/AnnouncerAdCard';
import Footer2 from '@components/Footer2/Footer2';
import MediasDialog from '@components/MediasDialog/MediasDialog';
import Nav2 from '@components/Nav2/Nav2';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { HiCheck, HiChevronUpDown, HiMagnifyingGlass } from 'react-icons/hi2';
import { useSearchParams, useParams } from '@router';
import { motion } from 'framer-motion';
import { getAdsByAnnouncer } from '@services/announceApi';
import { getAnnouncer } from '@services/announcerApi';
import { getMediasByAd } from '@services/mediaApi';
import { mediaUrl } from '@utils/mediaUrl';
import { Ad, Media, type Announcer } from '@utils/types';

import { useAuth } from '../../hooks/useAuth';

const sortOptions = [
  { name: 'Plus récent' },
  { name: 'Plus populaire' },
  { name: 'Prix croissant' },
  { name: 'Prix décroissant' },
];

function AnnouncerPageSkeleton() {
  return (
    <>
      <Nav2 />
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-gray-100'>
        <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mt-20 mb-8 overflow-hidden rounded-2xl bg-white'>
            <div className='h-32 animate-pulse bg-gray-400 sm:h-48' />
            <div className='px-6 py-6'>
              <div className='flex flex-col gap-6 sm:flex-row sm:items-center'>
                <div className='-mt-16 h-20 w-20 animate-pulse rounded-full border-4 border-white bg-gray-400 sm:-mt-20 sm:h-24 sm:w-24' />
                <div className='flex-1 space-y-3'>
                  <div className='h-7 w-56 animate-pulse rounded-full bg-gray-400' />
                  <div className='h-4 w-36 animate-pulse rounded-full bg-gray-300' />
                </div>
                <div className='flex gap-6 sm:gap-8'>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className='space-y-2 text-center'>
                      <div className='mx-auto h-7 w-10 animate-pulse rounded-full bg-gray-400' />
                      <div className='h-3 w-16 animate-pulse rounded-full bg-gray-300' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='mb-6 flex w-fit gap-2 rounded-xl bg-white p-1.5 shadow-sm'>
            <div className='h-10 w-28 animate-pulse rounded-full bg-gray-400' />
            <div className='h-10 w-28 animate-pulse rounded-full bg-gray-300' />
          </div>

          <div className='mb-6 flex flex-col gap-4 sm:flex-row'>
            <div className='h-12 flex-1 animate-pulse rounded-xl bg-gray-300' />
            <div className='h-12 w-full animate-pulse rounded-xl bg-gray-300 sm:w-64' />
          </div>

          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='overflow-hidden rounded-3xl bg-gray-200 shadow-sm'>
                <div className='aspect-[4/3] animate-pulse bg-gray-400' />
                <div className='space-y-3 p-4'>
                  <div className='h-4 w-3/4 animate-pulse rounded-full bg-gray-400' />
                  <div className='h-4 w-1/2 animate-pulse rounded-full bg-gray-300' />
                  <div className='h-9 w-full animate-pulse rounded-xl bg-gray-300' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function AnnouncerErrorState() {
  return (
    <div className='flex min-h-[55vh] items-center justify-center px-5 py-16 text-center'>
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
          Impossible de charger cet annonceur
        </h2>
        <p className='mt-3 text-sm leading-6 text-slate-500'>
          Une erreur interne est survenue. Veuillez réessayer dans quelques instants.
        </p>
      </div>
    </div>
  );
}

function EmptyAnnouncerAdsState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className='flex min-h-[42vh] items-center justify-center rounded-2xl bg-white px-5 py-16 text-center'>
      <div className='max-w-md'>
        <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[1.8rem] bg-orange-50 text-orange-500'>
          <svg viewBox='0 0 120 120' className='h-16 w-16' fill='none' aria-hidden='true'>
            <path d='M27 38h66v52a6 6 0 0 1-6 6H33a6 6 0 0 1-6-6V38Z' fill='#FFF4E5' stroke='currentColor' strokeWidth='5' />
            <path d='M43 38c0-10 7-18 17-18s17 8 17 18' stroke='currentColor' strokeWidth='5' strokeLinecap='round' />
            <path d='M43 61h34M43 75h22' stroke='currentColor' strokeWidth='5' strokeLinecap='round' />
            <circle cx='92' cy='25' r='5' fill='#FDBA74' />
            <circle cx='25' cy='22' r='4' fill='currentColor' />
          </svg>
        </div>
        <p className='text-xs font-black uppercase tracking-[0.24em] text-orange-500'>
          {searchTerm ? 'Aucun résultat' : 'Aucune annonce'}
        </p>
        <h2 className='mt-3 text-2xl font-black tracking-tight text-slate-950'>
          {searchTerm
            ? 'Aucune annonce ne correspond à votre recherche'
            : 'Cet annonceur n’a pas encore publié d’annonce'}
        </h2>
        <p className='mt-3 text-sm leading-6 text-slate-500'>
          {searchTerm
            ? 'Essayez avec un autre mot-clé ou videz le champ de recherche.'
            : 'Revenez plus tard pour découvrir ses prochaines publications.'}
        </p>
      </div>
    </div>
  );
}

function EmptyAnnouncerMediasState() {
  return (
    <div className='flex min-h-[38vh] items-center justify-center rounded-2xl bg-white px-5 py-14 text-center'>
      <div className='max-w-md'>
        <div className='mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-orange-50 text-orange-500'>
          <svg viewBox='0 0 120 120' className='h-14 w-14' fill='none' aria-hidden='true'>
            <rect x='24' y='30' width='72' height='56' rx='8' fill='#FFF4E5' stroke='currentColor' strokeWidth='5' />
            <path d='m31 76 18-18 13 13 10-10 18 18' stroke='currentColor' strokeWidth='5' strokeLinecap='round' strokeLinejoin='round' />
            <circle cx='76' cy='48' r='7' fill='currentColor' />
          </svg>
        </div>
        <p className='text-xs font-black uppercase tracking-[0.24em] text-orange-500'>Aucun média</p>
        <h2 className='mt-3 text-2xl font-black tracking-tight text-slate-950'>Aucun média publié</h2>
        <p className='mt-3 text-sm leading-6 text-slate-500'>Les images et vidéos des annonces de cet annonceur apparaîtront ici.</p>
      </div>
    </div>
  );
}

function isVideoMedia(media: Media) {
  return media.type?.toLowerCase().startsWith('video/');
}

export default function Announcer() {
  const coverSrc = typeof Cover === 'string' ? Cover : Cover.src;
  const domilixSrc = typeof Domilix === 'string' ? Domilix : Domilix.src;

  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const options = ['announces', 'medias', 'about'];
  const [urlSearchParam] = useSearchParams();
  const [option, setOption] = useState('announces');
  const { id } = useParams<{ id: string }>();

  const [ads, setAds] = useState<Ad[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [mediasLoading, setMediasLoading] = useState(false);
  const [showMediasDialog, setShowMediasDialog] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [announcer, setAnnouncer] = useState<Announcer | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(
    urlSearchParam.get('search') || ''
  );
  const canManageAds = Boolean(id && user?.announcer === id);
  const presentationSrc = mediaUrl(announcer?.presentation) || coverSrc;
  const avatarSrc = mediaUrl(announcer?.avatar) || domilixSrc;



  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchPageData = async () => {
      setLoading(true);
      setServerError(false);
      setAnnouncer(null);
      setAds([]);
      setMedias([]);

      try {
        const [announcerData, adsData] = await Promise.all([
          getAnnouncer(id),
          getAdsByAnnouncer(id, 1, 50),
        ]);

        if (!cancelled) {
          setAnnouncer(announcerData);
          setAds(adsData);
          setLoading(false);
          setMediasLoading(true);
        }

        const mediaLists = await Promise.all(
          adsData.map(ad => getMediasByAd(ad.id, 1).catch(() => [])),
        );
        const uniqueMedias = Array.from(
          new Map(mediaLists.flat().map(media => [media.id, media])).values(),
        );

        if (!cancelled) {
          setMedias(uniqueMedias);
        }
      } catch (error) {
        console.error('Error fetching announcer page:', error);
        if (!cancelled) {
          setServerError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setMediasLoading(false);
        }
      }
    };

    fetchPageData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const openMediaPreview = (index: number) => {
    setSelectedMediaIndex(index);
    setShowMediasDialog(true);
  };

  // Filter ads based on search term
  // const filteredAds = ads.filter(ad =>
  //   ad.description .toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  if (loading) return <AnnouncerPageSkeleton />;

  return (
    <>
      <Nav2 />
      <div className='bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {serverError ? (
            <AnnouncerErrorState />
          ) : (
            <>
              {/* Profile Header */}
              <motion.div
                {...fadeIn}
                className='bg-white rounded-2xl mt-20  overflow-hidden mb-8'
              >
            {/* Cover Image */}
            <div className='h-32 sm:h-48 relative overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600'>
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                src={presentationSrc}
                className='h-full w-full object-cover opacity-80'
                alt='Cover'
                onError={e => {
                  (e.target as HTMLImageElement).src = coverSrc;
                }}
              />
            </div>

            {/* Profile Info */}
            <div className='px-6 py-6'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
                {/* Profile Image */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className='relative w-20 h-20  sm:w-24 sm:h-24  shadow-sm rounded-full overflow-hidden bg-white  border-white border-4  -mt-16 sm:-mt-20'
                >
                  <img
                    src={avatarSrc}
                    className='object-cover w-full h-full'
                    alt='Profile'
                    onError={e => {
                      (e.target as HTMLImageElement).src = domilixSrc;
                    }}
                  />
                </motion.div>

                {/* Name and Info */}
                <div className='flex-1 min-w-0'>
                  <motion.h1
                    {...fadeIn}
                    transition={{ delay: 0.3 }}
                    className='text-xl sm:text-2xl font-bold text-gray-900 mb-1'
                  >
                    {announcer?.name || 'Chargement...'}
                  </motion.h1>
                  <motion.p
                    {...fadeIn}
                    transition={{ delay: 0.4 }}
                    className='text-gray-600 text-sm'
                  >
                    {announcer?.creation_date
                      ? `Membre depuis ${new Date(announcer.creation_date).getFullYear()}`
                      : 'Chargement...'}
                  </motion.p>
                  {announcer?.verified && (
                    <div className='flex items-center gap-1 mt-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-xs text-green-600 font-medium'>
                        Vérifié
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <motion.div
                  {...fadeIn}
                  transition={{ delay: 0.5 }}
                  className='flex gap-6 sm:gap-8'
                >
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-orange-500'>
                      {announcer?.furnitures || 0}
                    </div>
                    <div className='text-xs text-gray-600'>Meubles</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-orange-500'>
                      {announcer?.houses || 0}
                    </div>
                    <div className='text-xs text-gray-600'>Maisons</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-orange-500'>
                      {ads.length}
                    </div>
                    <div className='text-xs text-gray-600'>Annonces</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.6 }}
            className='flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm w-fit'
          >
            {options.map(menuItem => (
              <motion.button
                key={menuItem}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-2.5 rounded-full font-medium transition-all capitalize text-sm
                  ${
                    option === menuItem
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                onClick={() => setOption(menuItem)}
              >
                {menuItem === 'announces' && 'Annonces'}
                {menuItem === 'medias' && 'Médias'}
                {menuItem === 'about' && 'À propos'}
              </motion.button>
            ))}
          </motion.div>

          {option === 'announces' && (
            <>
              {/* Search and Filter Bar */}
              <div className='mb-6 flex flex-col sm:flex-row gap-4'>
                {/* Search Bar */}
                <div className='flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all'>
                  <HiMagnifyingGlass size={20} className='text-gray-400' />
                  <input
                    type='text'
                    placeholder='Rechercher une annonce...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='outline-none flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400'
                  />
                </div>

                {/* Sort Dropdown */}
                <div className='w-full sm:w-64'>
                  <Listbox value={selectedSort} onChange={setSelectedSort}>
                    <div className='relative'>
                      <Listbox.Button className='relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left shadow-sm border border-gray-200 hover:border-gray-300 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all'>
                        <span className='block truncate text-sm text-gray-700'>
                          {selectedSort.name}
                        </span>
                        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                          <HiChevronUpDown
                            className='h-5 w-5 text-gray-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <Listbox.Options className='absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none'>
                          {sortOptions.map((option, idx) => (
                            <Listbox.Option
                              key={idx}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm ${
                                  active
                                    ? 'bg-orange-50 text-orange-900'
                                    : 'text-gray-900'
                                }`
                              }
                              value={option}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-semibold' : 'font-normal'
                                    }`}
                                  >
                                    {option.name}
                                  </span>
                                  {selected && (
                                    <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-orange-600'>
                                      <HiCheck
                                        className='h-5 w-5'
                                        aria-hidden='true'
                                      />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              </div>

              {/* Listings */}
              {ads.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                  {ads.map(ad => (
                    <AnnouncerAdCard
                      key={ad.id}
                      ad={ad}
                      canManage={canManageAds}
                      onDeleted={deletedId =>
                        setAds(current => current.filter(item => item.id !== deletedId))
                      }
                      onUpdated={updatedAd =>
                        setAds(current =>
                          current.map(item => (item.id === updatedAd.id ? updatedAd : item))
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyAnnouncerAdsState searchTerm={searchTerm} />
              )}
            </>
          )}
          {option === 'medias' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'
            >
              <div className='mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
                <div>
                  <p className='text-xs font-black uppercase tracking-[0.22em] text-orange-500'>Galerie annonceur</p>
                  <h2 className='mt-1 text-2xl font-black tracking-tight text-slate-950'>Médias publiés</h2>
                </div>
                <p className='text-sm font-semibold text-gray-500'>
                  {medias.length} média{medias.length > 1 ? 's' : ''}
                </p>
              </div>

              {mediasLoading ? (
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className='aspect-square animate-pulse rounded-2xl bg-gray-200' />
                  ))}
                </div>
              ) : medias.length > 0 ? (
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
                  {medias.map((media, index) => (
                    <button
                      key={media.id}
                      type='button'
                      onClick={() => openMediaPreview(index)}
                      className='group relative aspect-square overflow-hidden rounded-2xl bg-gray-100 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-xl hover:ring-orange-200'
                    >
                      <img
                        src={mediaUrl(media.thumbnail || media.file) || ''}
                        alt='Média annonceur'
                        className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
                        loading='lazy'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-80 transition group-hover:opacity-100' />
                      {isVideoMedia(media) && (
                        <span className='absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur'>
                          Vidéo
                        </span>
                      )}
                      <span className='absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-900 backdrop-blur'>
                        Voir
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyAnnouncerMediasState />
              )}
            </motion.div>
          )}
          {option === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white rounded-2xl shadow-lg p-8'
            >
              {/* Bio Section */}
              <div className='mb-8'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Biographie
                </h2>
                <p className='text-gray-600 leading-relaxed'>
                  {announcer?.bio ||
                    'Aucune biographie disponible pour cet annonceur.'}
                </p>
              </div>

              {/* Contact Information */}
              {announcer && (
                <div className='border-t pt-8'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Informations de contact
                  </h3>
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                      <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <svg
                          className='w-5 h-5 text-orange-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                          />
                        </svg>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-gray-500 mb-1'>Email</p>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          {announcer.email}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                      <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <svg
                          className='w-5 h-5 text-orange-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                          />
                        </svg>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-gray-500 mb-1'>Téléphone</p>
                        <p className='text-sm font-medium text-gray-900'>
                          {announcer.contact}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                      <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <svg
                          className='w-5 h-5 text-orange-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-gray-500 mb-1'>Statut</p>
                        <p className='text-sm font-medium text-gray-900'>
                          {announcer.verified ? (
                            <span className='text-green-600'>
                              Compte vérifié
                            </span>
                          ) : (
                            <span className='text-gray-600'>Non vérifié</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                      <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <svg
                          className='w-5 h-5 text-orange-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                          />
                        </svg>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-gray-500 mb-1'>
                          Membre depuis
                        </p>
                        <p className='text-sm font-medium text-gray-900'>
                          {new Date(announcer.creation_date).toLocaleDateString(
                            'fr-FR',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
            </>
          )}
        </div>
      </div>
      <Footer2 />
      {showMediasDialog && (
        <MediasDialog
          medias={medias}
          initialIndex={selectedMediaIndex}
          toggleModal={() => setShowMediasDialog(false)}
        />
      )}
    </>
  );
}
