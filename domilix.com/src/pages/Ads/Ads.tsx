import Nav2 from '@components/Nav2/Nav2';
import Footer2 from '@components/Footer2/Footer2';
import ProductCard from '@components/ProductCard/ProductCard';
import AddressAutocomplete from '@components/AddressAutocomplete/AddressAutocomplete';
import { getAds, getCategories } from '@services/announceApi';
import { Ad } from '@utils/types';
import React, { useCallback, useEffect, useState } from 'react';
import { HiAdjustmentsHorizontal } from 'react-icons/hi2';
import { MdSearch } from 'react-icons/md';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Ads(): React.ReactElement {
  const [ads, setAds] = useState<Ad[]>([]);
  const [nextPage, setNextPage] = useState<string | null>('ads');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false); // State for filter sidebar
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    budget_min: '',
    budget_max: '',
    category_id: [] as string[],
    standing: '',
    bedroom_min: '',
    bedroom_max: '',
    ad_type: '',
    amenities: [] as string[],
  });
  const [UrlSearchParam] = useSearchParams();
  const navigate = useNavigate();

  // Compter les filtres actifs
  const activeFiltersCount = Object.entries(filters).reduce(
    (count, [key, value]) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return value && value.toString().trim() ? count + 1 : count;
    },
    0
  );

  const handleFilterButtonClick = () => {
    setIsFilterSidebarOpen(!isFilterSidebarOpen); // Toggle filter sidebar visibility
  };

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories('house');
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };
    loadCategories();
  }, []);

  // Initialiser la valeur de recherche et les filtres depuis l'URL
  useEffect(() => {
    const searchParam = UrlSearchParam.get('search');
    if (searchParam) {
      setSearchLocation(searchParam);
    }

    // Initialiser les filtres depuis l'URL
    const newFilters = {
      budget_min: UrlSearchParam.get('budget_min') || '',
      budget_max: UrlSearchParam.get('budget_max') || '',
      category_id: UrlSearchParam.getAll('category_id'),
      standing: UrlSearchParam.get('standing') || '',
      bedroom_min: UrlSearchParam.get('bedroom_min') || '',
      bedroom_max: UrlSearchParam.get('bedroom_max') || '',
      ad_type: UrlSearchParam.get('ad_type') || '',
      amenities: UrlSearchParam.getAll('amenities'),
    };
    setFilters(newFilters);
  }, [UrlSearchParam]);

  // Gérer la sélection d'une localisation
  const handleLocationSelect = (location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  }) => {
    const searchQuery = location.city || location.address;
    setSearchLocation(searchQuery);

    // Mettre à jour l'URL avec la nouvelle recherche
    const newSearchParams = new URLSearchParams(UrlSearchParam);
    newSearchParams.set('search', searchQuery);
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  // Gérer la recherche manuelle
  const handleSearchChange = (value: string) => {
    setSearchLocation(value);
  };

  // Gérer la soumission de recherche (Enter ou clic)
  const handleSearchSubmit = () => {
    if (searchLocation.trim()) {
      const newSearchParams = new URLSearchParams(UrlSearchParam);
      newSearchParams.set('search', searchLocation.trim());
      navigate(`?${newSearchParams.toString()}`, { replace: true });
    }
  };

  // Gérer les changements de filtres
  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Gérer les filtres de catégorie (checkbox multiple)
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      category_id: checked
        ? [...prev.category_id, categoryId]
        : prev.category_id.filter(id => id !== categoryId),
    }));
  };

  // Gérer les filtres d'équipements (checkbox multiple)
  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity),
    }));
  };

  // Appliquer les filtres
  const applyFilters = () => {
    const newSearchParams = new URLSearchParams(UrlSearchParam);

    // Ajouter les filtres non vides aux paramètres URL
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          value.forEach(v => newSearchParams.append(key, v));
        }
      } else if (value && value.toString().trim()) {
        newSearchParams.set(key, value.toString());
      }
    });

    navigate(`?${newSearchParams.toString()}`, { replace: true });
    setIsFilterSidebarOpen(false);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      budget_min: '',
      budget_max: '',
      category_id: [],
      standing: '',
      bedroom_min: '',
      bedroom_max: '',
      ad_type: '',
      amenities: [],
    });
    const newSearchParams = new URLSearchParams();
    if (searchLocation) {
      newSearchParams.set('search', searchLocation);
    }
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const getMoreAds = useCallback(() => {
    setIsLoadingMore(true);

    // Construire les paramètres de requête à partir de l'URL
    const params: Record<string, any> = {
      page: 1,
    };

    // Ajouter tous les paramètres de l'URL
    UrlSearchParam.forEach((value, key) => {
      if (key === 'category_id' || key === 'amenities') {
        // Pour les paramètres multiples, créer un tableau
        if (!params[key]) params[key] = [];
        params[key].push(value);
      } else {
        params[key] = value;
      }
    });

    getAds(params)
      .then(response => {
        // Vérifier la structure de la réponse
        const responseData = Array.isArray(response)
          ? response
          : response.data || [];
        const responseLinks = response.links || null;

        setAds([...ads, ...responseData]);
        setNextPage(responseLinks?.next || null);
        setIsLoadingMore(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des annonces:', error);
        setIsLoadingMore(false);
      });
  }, [isLoadingMore, ads, UrlSearchParam]);

  useEffect(() => {
    setNextPage('ads');
    setAds([]);
  }, [UrlSearchParam]);

  useEffect(() => {
    let canLoadMore = true;

    function handleScrollEvent() {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight &&
        !isLoadingMore &&
        nextPage &&
        ads.length &&
        canLoadMore
      ) {
        canLoadMore = false;
        getMoreAds();
      }
    }

    if (!ads.length && !isLoadingMore) {
      console.log('test');
      getMoreAds();
    }

    window.addEventListener('scroll', handleScrollEvent);

    return () => {
      window.removeEventListener('scroll', handleScrollEvent);
    };
  }, [nextPage, isLoadingMore, getAds, ads]);

  return (
    <>
      <Nav2 />
      {isFilterSidebarOpen && (
        <>
          {/* Overlay for mobile */}
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden'
            onClick={() => setIsFilterSidebarOpen(false)}
          />

          {/* Filter Sidebar */}
          <div className='fixed z-30 border-r border-r-gray-100 shadow-xl left-0 w-full sm:w-[340px] bg-gray-200 rounded-lg h-[calc(100%-180px)] top-44 text-sm overflow-y-auto transition-transform duration-300 ease-in-out'>
            <div className='p-6'>
              {/* Header */}
              <div className='flex items-center justify-between mb-8'>
                <h1 className='text-lg font-semibold text-gray-800'>Filtres</h1>
                <button
                  onClick={() => setIsFilterSidebarOpen(false)}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              {/* Budget Section */}
              <div className='mb-8'>
                <h2 className='font-medium text-gray-800 mb-4'>Budget</h2>
                <div className='space-y-3'>
                  <div className='relative'>
                    <input
                      type='number'
                      placeholder='Prix minimum'
                      value={filters.budget_min}
                      onChange={e =>
                        handleFilterChange('budget_min', e.target.value)
                      }
                      className='w-full pl-12 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200'
                    />
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                      Min
                    </span>
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                      FCFA
                    </span>
                  </div>
                  <div className='relative'>
                    <input
                      type='number'
                      placeholder='Prix maximum'
                      value={filters.budget_max}
                      onChange={e =>
                        handleFilterChange('budget_max', e.target.value)
                      }
                      className='w-full pl-12 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200'
                    />
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                      Max
                    </span>
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                      FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories Section */}
              <div className='mb-8'>
                <h2 className='font-medium text-gray-800 mb-4'>Catégories</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className='relative flex items-center p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-orange-200 hover:bg-orange-50 transition-all duration-200'
                    >
                      <input
                        type='checkbox'
                        className='peer hidden'
                        checked={filters.category_id.includes(category.id)}
                        onChange={e =>
                          handleCategoryChange(category.id, e.target.checked)
                        }
                      />
                      <div className='flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-md flex items-center justify-center mr-3 peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-colors duration-200'>
                        <svg
                          className='w-3 h-3 text-white hidden peer-checked:block'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <span className='text-gray-700 peer-checked:text-orange-500 truncate'>
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Standing Section */}
              <div className='mb-8'>
                <h2 className='font-medium text-gray-800 mb-4'>Standing</h2>
                <div className='grid grid-cols-1 gap-2'>
                  {[
                    { key: 'standard', name: 'Standard' },
                    { key: 'confort', name: 'Confort' },
                    { key: 'haut_standing', name: 'Haut Standing' },
                  ].map(standing => (
                    <label
                      key={standing.key}
                      className='relative flex items-center p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-orange-200 hover:bg-orange-50 transition-all duration-200'
                    >
                      <input
                        type='radio'
                        name='standing'
                        value={standing.key}
                        checked={filters.standing === standing.key}
                        onChange={e =>
                          handleFilterChange('standing', e.target.value)
                        }
                        className='peer hidden'
                      />
                      <div className='flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center mr-3 peer-checked:border-orange-500'>
                        <div className='w-2.5 h-2.5 rounded-full bg-orange-500 hidden peer-checked:block'></div>
                      </div>
                      <span className='text-gray-700 peer-checked:text-orange-500 truncate'>
                        {standing.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Number of Rooms Section */}
              <div className='mb-8'>
                <h2 className='font-medium text-gray-800 mb-4'>
                  Nombre de Chambres
                </h2>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='relative'>
                    <input
                      type='number'
                      min='0'
                      placeholder='Min'
                      value={filters.bedroom_min}
                      onChange={e =>
                        handleFilterChange('bedroom_min', e.target.value)
                      }
                      className='w-full pl-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200'
                    />
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                      Min
                    </span>
                  </div>
                  <div className='relative'>
                    <input
                      type='number'
                      min='0'
                      placeholder='Max'
                      value={filters.bedroom_max}
                      onChange={e =>
                        handleFilterChange('bedroom_max', e.target.value)
                      }
                      className='w-full pl-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200'
                    />
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                      Max
                    </span>
                  </div>
                </div>
              </div>

              {/* Type d'annonce Section */}
              <div className='mb-8'>
                <h2 className='font-medium text-gray-800 mb-4'>
                  Type d'annonce
                </h2>
                <div className='grid grid-cols-1 gap-2'>
                  {[
                    { key: '', name: 'Tous' },
                    { key: 'location', name: 'Location' },
                    { key: 'sale', name: 'Vente' },
                  ].map(type => (
                    <label
                      key={type.key}
                      className='relative flex items-center p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-orange-200 hover:bg-orange-50 transition-all duration-200'
                    >
                      <input
                        type='radio'
                        name='ad_type'
                        value={type.key}
                        checked={filters.ad_type === type.key}
                        onChange={e =>
                          handleFilterChange('ad_type', e.target.value)
                        }
                        className='peer hidden'
                      />
                      <div className='flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center mr-3 peer-checked:border-orange-500'>
                        <div className='w-2.5 h-2.5 rounded-full bg-orange-500 hidden peer-checked:block'></div>
                      </div>
                      <span className='text-gray-700 peer-checked:text-orange-500 truncate'>
                        {type.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Équipements Section */}
              <div className='mb-20'>
                <h2 className='font-medium text-gray-800 mb-4'>Équipements</h2>
                <div className='grid grid-cols-1 gap-2'>
                  {[
                    { key: 'gate', name: 'Portail' },
                    { key: 'pool', name: 'Piscine' },
                    { key: 'garage', name: 'Garage' },
                    { key: 'furnitured', name: 'Meublé' },
                  ].map(amenity => (
                    <label
                      key={amenity.key}
                      className='relative flex items-center p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-orange-200 hover:bg-orange-50 transition-all duration-200'
                    >
                      <input
                        type='checkbox'
                        className='peer hidden'
                        checked={filters.amenities.includes(amenity.key)}
                        onChange={e =>
                          handleAmenityChange(amenity.key, e.target.checked)
                        }
                      />
                      <div className='flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-md flex items-center justify-center mr-3 peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-colors duration-200'>
                        <svg
                          className='w-3 h-3 text-white hidden peer-checked:block'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <span className='text-gray-700 peer-checked:text-orange-500 truncate'>
                        {amenity.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Filters Button - Fixed at bottom */}
            <div className='fixed bottom-0 left-0 w-full sm:w-[340px] p-4 bg-white border-t border-gray-100'>
              <div className='space-y-2'>
                <button
                  onClick={applyFilters}
                  className='w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors duration-200'
                >
                  Appliquer les filtres
                </button>
                <button
                  onClick={resetFilters}
                  className='w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200'
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className='bg-gray-50 z-20 fixed top-16 w-screen justify-center flex items-center md:justify-between lg:justify-between px-10  py-5'>
        <div className='flex'>
          <span className='hidden lg:block'>Toutes les</span>&nbsp;
          <span className='capitalize lg:normal-case md:normal hidden xl:block lg:block md:block '>
            categories
          </span>
        </div>
        &nbsp;
        <div className='max-w-md w-full relative'>
          <div className='flex rounded-full px-3 py-2 bg-white border border-gray-300 shadow-lg shadow-gray-300 items-center'>
            <MdSearch size={28} className='text-gray-800 flex-shrink-0' />
            <div className='flex-1 px-2'>
              <AddressAutocomplete
                value={searchLocation}
                onChange={handleSearchChange}
                onLocationSelect={handleLocationSelect}
                placeholder='Rechercher une localisation...'
                className='border-0 focus:border-0 focus:ring-0 p-0 py-2 text-[1rem] text-gray-600 font-normal bg-transparent w-full outline-none'
              />
            </div>
            {/* Bouton de géolocalisation */}
            <button
              type='button'
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    async position => {
                      const { longitude, latitude } = position.coords;
                      try {
                        const { reverseGeocode } = await import(
                          '@services/mapboxApi'
                        );
                        const result = await reverseGeocode(
                          longitude,
                          latitude
                        );
                        if (result) {
                          const searchQuery =
                            result.context?.find(c => c.id.startsWith('place'))
                              ?.text || result.text;
                          setSearchLocation(searchQuery);
                          const newSearchParams = new URLSearchParams(
                            UrlSearchParam
                          );
                          newSearchParams.set('search', searchQuery);
                          navigate(`?${newSearchParams.toString()}`, {
                            replace: true,
                          });
                        }
                      } catch (error) {
                        console.error('Erreur de géocodage inverse:', error);
                      }
                    },
                    error => {
                      console.error('Erreur de géolocalisation:', error);
                      alert("Impossible d'obtenir votre position.");
                    }
                  );
                }
              }}
              className='flex items-center px-2 text-gray-400 hover:text-orange-500 transition-colors duration-200'
              title='Utiliser ma position'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
            </button>
          </div>
        </div>{' '}
        &nbsp;
        <button
          className={
            (isFilterSidebarOpen && 'bg-gray-200 ') +
            ' inline-flex py-2 px-4 rounded-lg  items-center gap-2 text-gray-800 relative'
          }
          onClick={handleFilterButtonClick}
        >
          <HiAdjustmentsHorizontal size={24} />
          <span className=' hidden lg:block md:block '>filtre avancé</span>
          {activeFiltersCount > 0 && (
            <span className='absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className=' min-h-screen'>
        <section
          className={`grid gap-y-6 gap-x-2 sm:gap-x-6 lg:gap-x-4 mt-40 py-4 px-4 sm:px-6 lg:px-8 
          ${
            isFilterSidebarOpen
              ? 'lg:ml-[340px] lg:w-[calc(100%-340px)] 2xl:!grid-cols-3  xl:!grid-cols-2 '
              : 'w-full'
          }
          grid-cols-1   sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`}
        >
          {ads.map(ad => (
            <ProductCard {...ad} key={ad.id} />
          ))}
        </section>
      </div>
      <Footer2 />
    </>
  );
}
