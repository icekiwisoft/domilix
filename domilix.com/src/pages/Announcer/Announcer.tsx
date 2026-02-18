import Cover from '@assets/bg_img/cover_annonceur.jpg';
import Domilix from '@assets/domilix_icon.png';
import Footer2 from '@components/Footer2/Footer2';
import Nav2 from '@components/Nav2/Nav2';
import ProductCard from '@components/ProductCard/ProductCard';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { HiCheck, HiChevronUpDown, HiMagnifyingGlass } from 'react-icons/hi2';
import { useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAdsByAnnouncer } from '@services/announceApi';
import { getAnnouncer } from '@services/announcerApi';
import { Ad, type Announcer } from '@utils/types';

const sortOptions = [
  { name: 'Plus récent' },
  { name: 'Plus populaire' },
  { name: 'Prix croissant' },
  { name: 'Prix décroissant' },
];

export default function Announcer() {
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const options = ['announces', 'about'];
  const [urlSearchParam] = useSearchParams();
  const [option, setOption] = useState('announces');
  const { id } = useParams<{ id: string }>();

  const [ads, setAds] = useState<Ad[]>([]);
  const [announcer, setAnnouncer] = useState<Announcer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    urlSearchParam.get('search') || ''
  );



  // Fetch announcer data
  const fetchAnnouncerData = async (announcerId: string) => {
    try {
      const announcerData = await getAnnouncer(announcerId);
      setAnnouncer(announcerData);
    } catch (error) {
      console.error('Error fetching announcer:', error);
    }
  };

  // Fetch announcer's ads
  const fetchAnnouncerAds = async (announcerId: string) => {
    try {
      setLoading(true);
      const adsData = await getAdsByAnnouncer(announcerId, 1, 50);
      setAds(adsData);
    } catch (error) {
      console.error('Error fetching ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAnnouncerData(id);
      fetchAnnouncerAds(id);
    }
  }, [id]);

  // Filter ads based on search term
  // const filteredAds = ads.filter(ad =>
  //   ad.description .toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <>
      <Nav2 />
      <div className='bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
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
                src={Cover}
                className='h-full w-full object-cover opacity-80'
                alt='Cover'
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
                    src={"http://localhost:8000"+announcer?.avatar}
                    className='object-cover w-full h-full'
                    alt='Profile'
                    onError={e => {
                      (e.target as HTMLImageElement).src = Domilix;
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
                {menuItem === 'announces' ? 'Annonces' : 'À propos'}
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
              {loading ? (
                <div className='flex flex-col justify-center items-center py-20'>
                  <div className='w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin'></div>
                  <p className='mt-4 text-gray-500 text-sm'>
                    Chargement des annonces...
                  </p>
                </div>
              ) : ads.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                  {ads.map(ad => (
                    <ProductCard key={ad.id} {...ad} />
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-20 bg-white rounded-xl'>
                  <div className='text-gray-400 mb-4'>
                    <svg
                      className='w-16 h-16'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                      />
                    </svg>
                  </div>
                  <p className='text-gray-600 text-lg font-medium mb-1'>
                    {searchTerm ? 'Aucun résultat' : 'Aucune annonce'}
                  </p>
                  <p className='text-gray-400 text-sm'>
                    {searchTerm
                      ? "Essayez avec d'autres mots-clés"
                      : "Cet annonceur n'a pas encore publié d'annonces"}
                  </p>
                </div>
              )}
            </>
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
        </div>
      </div>
      <Footer2 />
    </>
  );
}
