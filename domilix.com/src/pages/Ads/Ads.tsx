import Nav2 from '@components/Nav2/Nav2';
import FooterMinimal from '@components/FooterMinimal/FooterMinimal';
import ProductCard from '@components/ProductCard/ProductCard';
import AddressAutocomplete from '@components/AddressAutocomplete/AddressAutocomplete';
import { Checkbox, RadioGroup } from '@headlessui/react';
import { getAds, getCategories } from '@services/announceApi';
import { Ad } from '@utils/types';
import React, { useCallback, useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Ads(): React.ReactElement {
  const [ads, setAds] = useState<Ad[]>([]);
  const [nextPage, setNextPage] = useState<string | null>('ads');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [openFilterPopup, setOpenFilterPopup] = useState<
    null | 'budget' | 'type' | 'standing' | 'amenities'
  >(null);
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
    (count, [, value]) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return value && value.toString().trim() ? count + 1 : count;
    },
    0
  );

  const budgetSummary =
    filters.budget_min || filters.budget_max
      ? `${filters.budget_min || '0'} - ${filters.budget_max || '...'} FCFA`
      : 'Definir un budget';

  const adTypeSummary =
    filters.ad_type === 'location'
      ? 'Location'
      : filters.ad_type === 'sale'
        ? 'Vente'
        : 'Tous types';

  const filterSummary =
    filters.category_id.length > 0
      ? `${filters.category_id.length} categorie${filters.category_id.length > 1 ? 's' : ''}`
      : 'Aucune categorie';

  const standingSummary =
    filters.standing === 'standard'
      ? 'Standard'
      : filters.standing === 'confort'
        ? 'Confort'
        : filters.standing === 'haut_standing'
          ? 'Haut Standing'
          : 'Tous niveaux';

  const amenitiesSummary =
    filters.amenities.length > 0
      ? `${filters.amenities.length} equipement${filters.amenities.length > 1 ? 's' : ''}`
      : 'Aucun equipement';

  const renderFilterPopupContent = (
    popup: 'budget' | 'type' | 'standing' | 'amenities'
  ) => {
    return (
      <>
        {popup === 'budget' && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold tracking-tight text-gray-900'>
              Budget
            </h3>
            <p className='text-xs text-gray-500'>Definissez votre fourchette</p>
            <div className='space-y-2'>
              <input
                type='number'
                placeholder='Prix minimum'
                value={filters.budget_min}
                onChange={e => handleFilterChange('budget_min', e.target.value)}
                className='h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition-colors focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100'
              />
              <input
                type='number'
                placeholder='Prix maximum'
                value={filters.budget_max}
                onChange={e => handleFilterChange('budget_max', e.target.value)}
                className='h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition-colors focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100'
              />
            </div>
          </div>
        )}

        {popup === 'type' && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold tracking-tight text-gray-900'>
              Type et categories
            </h3>
            <RadioGroup
              value={filters.ad_type}
              onChange={(value: string) => handleFilterChange('ad_type', value)}
              className='space-y-2'
            >
              {[
                { key: '', name: 'Tous' },
                { key: 'location', name: 'Location' },
                { key: 'sale', name: 'Vente' },
              ].map(type => (
                <RadioGroup.Option
                  key={type.key}
                  value={type.key}
                  className='flex cursor-pointer items-center gap-2 rounded-md px-1 py-1'
                >
                  {({ checked }) => (
                    <>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          checked ? 'border-orange-500' : 'border-gray-300'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            checked ? 'bg-orange-500' : 'bg-transparent'
                          }`}
                        />
                      </span>
                      <span className='text-sm text-gray-700'>{type.name}</span>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
            <div className='max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/70 p-2.5'>
              {categories.map(category => (
                <Checkbox
                  key={category.id}
                  checked={filters.category_id.includes(category.id)}
                  onChange={(checked: boolean) =>
                    handleCategoryChange(category.id, checked)
                  }
                  className='group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white'
                >
                  <span className='flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white group-data-[checked]:border-orange-500'>
                    <svg
                      viewBox='0 0 16 16'
                      fill='none'
                      className='hidden h-3 w-3 text-orange-500 group-data-[checked]:block'
                    >
                      <path
                        d='M3 8.5L6.2 11.2L13 4.5'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </span>
                  <span className='text-sm text-gray-700'>{category.name}</span>
                </Checkbox>
              ))}
            </div>
          </div>
        )}

        {popup === 'standing' && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold tracking-tight text-gray-900'>
              Standing
            </h3>
            <RadioGroup
              value={filters.standing}
              onChange={(value: string) =>
                handleFilterChange('standing', value)
              }
              className='space-y-2'
            >
              {[
                { key: '', name: 'Tous' },
                { key: 'standard', name: 'Standard' },
                { key: 'confort', name: 'Confort' },
                { key: 'haut_standing', name: 'Haut Standing' },
              ].map(standing => (
                <RadioGroup.Option
                  key={standing.key}
                  value={standing.key}
                  className='flex cursor-pointer items-center gap-2 rounded-md px-1 py-1'
                >
                  {({ checked }) => (
                    <>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          checked ? 'border-orange-500' : 'border-gray-300'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            checked ? 'bg-orange-500' : 'bg-transparent'
                          }`}
                        />
                      </span>
                      <span className='text-sm text-gray-700'>
                        {standing.name}
                      </span>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </div>
        )}

        {popup === 'amenities' && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold tracking-tight text-gray-900'>
              Equipements
            </h3>
            <div className='grid grid-cols-1 gap-2'>
              {[
                { key: 'gate', name: 'Portail' },
                { key: 'pool', name: 'Piscine' },
                { key: 'garage', name: 'Garage' },
                { key: 'furnitured', name: 'Meuble' },
              ].map(amenity => (
                <Checkbox
                  key={amenity.key}
                  checked={filters.amenities.includes(amenity.key)}
                  onChange={(checked: boolean) =>
                    handleAmenityChange(amenity.key, checked)
                  }
                  className='group flex cursor-pointer items-center gap-2 rounded-md px-1 py-1'
                >
                  <span className='flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white group-data-[checked]:border-orange-500'>
                    <svg
                      viewBox='0 0 16 16'
                      fill='none'
                      className='hidden h-3 w-3 text-orange-500 group-data-[checked]:block'
                    >
                      <path
                        d='M3 8.5L6.2 11.2L13 4.5'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </span>
                  <span className='text-sm text-gray-700'>{amenity.name}</span>
                </Checkbox>
              ))}
            </div>
          </div>
        )}

        <div className='mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3'>
          <button
            type='button'
            onClick={resetFilters}
            className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800'
          >
            Reinitialiser
          </button>
          <button
            type='button'
            onClick={applyFilters}
            className='rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:from-orange-600 hover:to-amber-600'
          >
            Appliquer
          </button>
        </div>
      </>
    );
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

    if (searchLocation.trim()) {
      newSearchParams.set('search', searchLocation.trim());
    } else {
      newSearchParams.delete('search');
    }

    [
      'budget_min',
      'budget_max',
      'standing',
      'bedroom_min',
      'bedroom_max',
      'ad_type',
      'category_id',
      'amenities',
    ].forEach(param => newSearchParams.delete(param));

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
    setOpenFilterPopup(null);
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
      .then((response: any) => {
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
      <div className='fixed top-16 z-20 w-screen border-b border-gray-200/70 bg-gradient-to-r from-white to-gray-300/90 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8'>
        <div className='mx-auto w-full max-w-6xl'>
          <div className='relative'>
            <div className='flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 shadow-sm'>
              <div className='flex h-[52px] min-w-0 flex-1 flex-col justify-center rounded-full bg-white px-7'>
                <span className='block text-xs font-semibold text-gray-800'>
                  Localisation
                </span>
                <AddressAutocomplete
                  value={searchLocation}
                  onChange={handleSearchChange}
                  onLocationSelect={handleLocationSelect}
                  placeholder='Rechercher une localisation'
                  className='h-5 w-full border-0 bg-transparent p-0 text-sm leading-5 text-gray-600 outline-none placeholder:text-gray-400 focus:border-0 focus:ring-0'
                />
              </div>

              <div className='hidden h-10 w-px bg-gray-200 md:block' />

              <div className='relative hidden min-w-0 flex-1 md:block'>
                <button
                  type='button'
                  onClick={() =>
                    setOpenFilterPopup(current =>
                      current === 'budget' ? null : 'budget'
                    )
                  }
                  className='h-[52px] w-full rounded-full px-7 py-1.5 text-left transition-colors hover:bg-gray-50'
                >
                  <span className='block text-xs font-semibold text-gray-800'>
                    Budget
                  </span>
                  <span className='block truncate text-sm text-gray-500'>
                    {budgetSummary}
                  </span>
                </button>
                {openFilterPopup === 'budget' && (
                  <div className='absolute left-0 top-[calc(100%+8px)] z-40 w-72 max-w-[90vw] rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.55)] ring-1 ring-black/5'>
                    {renderFilterPopupContent('budget')}
                  </div>
                )}
              </div>

              <div className='hidden h-10 w-px bg-gray-200 md:block' />

              <div className='relative hidden min-w-0 flex-1 md:block'>
                <button
                  type='button'
                  onClick={() =>
                    setOpenFilterPopup(current =>
                      current === 'type' ? null : 'type'
                    )
                  }
                  className='h-[52px] w-full rounded-full px-7 py-1.5 text-left transition-colors hover:bg-gray-50'
                >
                  <span className='block text-xs font-semibold text-gray-800'>
                    Type et categories
                  </span>
                  <span className='block truncate text-sm text-gray-500'>
                    {adTypeSummary} . {filterSummary}
                  </span>
                </button>
                {openFilterPopup === 'type' && (
                  <div className='absolute left-0 top-[calc(100%+8px)] z-40 w-80 max-w-[90vw] rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.55)] ring-1 ring-black/5'>
                    {renderFilterPopupContent('type')}
                  </div>
                )}
              </div>

              <div className='hidden h-10 w-px bg-gray-200 lg:block' />

              <div className='relative hidden min-w-0 flex-1 lg:block'>
                <button
                  type='button'
                  onClick={() =>
                    setOpenFilterPopup(current =>
                      current === 'standing' ? null : 'standing'
                    )
                  }
                  className='h-[52px] w-full rounded-full px-7 py-1.5 text-left transition-colors hover:bg-gray-50'
                >
                  <span className='block text-xs font-semibold text-gray-800'>
                    Standing
                  </span>
                  <span className='block truncate text-sm text-gray-500'>
                    {standingSummary}
                  </span>
                </button>
                {openFilterPopup === 'standing' && (
                  <div className='absolute left-0 top-[calc(100%+8px)] z-40 w-72 max-w-[90vw] rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.55)] ring-1 ring-black/5'>
                    {renderFilterPopupContent('standing')}
                  </div>
                )}
              </div>

              <div className='hidden h-10 w-px bg-gray-200 lg:block' />

              <div className='relative hidden min-w-0 flex-1 lg:block'>
                <button
                  type='button'
                  onClick={() =>
                    setOpenFilterPopup(current =>
                      current === 'amenities' ? null : 'amenities'
                    )
                  }
                  className='h-[52px] w-full rounded-full px-7 py-1.5 text-left transition-colors hover:bg-gray-50'
                >
                  <span className='block text-xs font-semibold text-gray-800'>
                    Equipements
                  </span>
                  <span className='block truncate text-sm text-gray-500'>
                    {amenitiesSummary}
                  </span>
                </button>
                {openFilterPopup === 'amenities' && (
                  <div className='absolute right-0 top-[calc(100%+8px)] z-40 w-72 max-w-[90vw] rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.55)] ring-1 ring-black/5'>
                    {renderFilterPopupContent('amenities')}
                  </div>
                )}
              </div>

              <div className='relative md:hidden'>
                <button
                  type='button'
                  onClick={() =>
                    setOpenFilterPopup(current =>
                      current === 'budget' ? null : 'budget'
                    )
                  }
                  className='mx-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100'
                  title='Ouvrir les filtres'
                >
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 6h16M7 12h10M10 18h4'
                    />
                  </svg>
                </button>
                {openFilterPopup === 'budget' && (
                  <div className='absolute right-0 top-[calc(100%+8px)] z-40 w-[86vw] max-w-xs rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.55)] ring-1 ring-black/5'>
                    {renderFilterPopupContent('budget')}
                  </div>
                )}
              </div>

              <button
                type='button'
                onClick={applyFilters}
                className='relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm transition-all hover:from-orange-600 hover:to-amber-600'
                title='Rechercher'
              >
                <MdSearch size={18} />
                {activeFiltersCount > 0 && (
                  <span className='absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] leading-none text-white'>
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className=' min-h-screen'>
        <div className='mt-40 px-5 sm:px-8 lg:px-12'>
          <div className='flex min-h-[44px] items-center justify-between gap-3'>
            <h2 className='mb-0 text-xl font-semibold leading-tight text-gray-900 sm:text-2xl'>
              Annonces qui pourraient vous plaire !
            </h2>
            <button
              type='button'
              className='ml-auto inline-flex h-10 items-center rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 text-sm font-semibold text-orange-700 transition-colors hover:from-orange-100 hover:to-amber-100'
            >
              Publier la mienne !
            </button>
          </div>
        </div>
        <section className='mt-6 grid w-full grid-cols-1 gap-x-2 gap-y-6 px-5 py-6 sm:grid-cols-2 sm:gap-x-6 sm:px-8 lg:grid-cols-3 lg:gap-x-4 lg:px-12 xl:grid-cols-4 2xl:grid-cols-6'>
          {ads.map(ad => (
            <ProductCard {...ad} key={ad.id} />
          ))}
        </section>
      </div>
      <FooterMinimal />
    </>
  );
}
