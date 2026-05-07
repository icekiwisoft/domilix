import AddressAutocomplete from '@components/AddressAutocomplete/AddressAutocomplete';
import FooterMinimal from '@components/FooterMinimal/FooterMinimal';
import Nav2 from '@components/Nav2/Nav2';
import ProductCard from '@components/ProductCard/ProductCard';
import { getAds, getCategories } from '@services/announceApi';
import { Ad } from '@utils/types';
import { Checkbox, RadioGroup } from '@headlessui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { useNavigate, useSearchParams } from '@router';

function SearchSkeleton() {
  return (
    <section className='mt-4 grid w-full grid-cols-1 gap-x-4 gap-y-6 px-5 py-6 sm:grid-cols-2 sm:gap-x-6 sm:px-8 lg:grid-cols-3 lg:px-12 xl:grid-cols-4'>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className='overflow-hidden rounded-xl bg-surface-container shadow-card'>
          <div className='aspect-[4/3] animate-pulse bg-surface-container-high' />
          <div className='space-y-3 p-4'>
            <div className='h-4 w-3/4 animate-pulse rounded-full bg-surface-container-high' />
            <div className='h-4 w-1/2 animate-pulse rounded-full bg-surface-container' />
            <div className='flex items-center justify-between pt-2'>
              <div className='h-5 w-24 animate-pulse rounded-full bg-surface-container-high' />
              <div className='h-9 w-9 animate-pulse rounded-full bg-surface-container' />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function EmptySearchState() {
  return (
    <div className='mt-28 flex min-h-[50vh] items-center justify-center px-5 py-16 text-center sm:mt-32 sm:px-8 md:mt-44 lg:px-12'>
      <div className='max-w-md'>
        <div className='mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-primary/10 text-primary'>
          <svg viewBox='0 0 120 120' className='h-20 w-20' fill='none' aria-hidden='true'>
            <circle cx='53' cy='53' r='31' fill='currentColor' fillOpacity='0.08' stroke='currentColor' strokeWidth='5' />
            <path d='M75 75L94 94' stroke='currentColor' strokeWidth='7' strokeLinecap='round' />
            <path d='M42 49h23M42 61h14' stroke='currentColor' strokeWidth='5' strokeLinecap='round' />
            <path d='M31 27c5-7 12-11 22-12M88 36c4 7 5 15 3 23' stroke='currentColor' strokeOpacity='0.4' strokeWidth='5' strokeLinecap='round' />
            <circle cx='82' cy='25' r='5' fill='currentColor' />
            <circle cx='28' cy='82' r='4' fill='currentColor' fillOpacity='0.4' />
          </svg>
        </div>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-primary'>
          Aucun résultat
        </p>
        <h2 className='mt-3 text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
          Oups, il n'y a aucun résultat
        </h2>
        <p className='mt-3 text-sm leading-6 text-on-surface-variant'>
          Essayez de modifier vos filtres ou de rechercher une autre localisation.
        </p>
      </div>
    </div>
  );
}

export default function Search(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchLocation, setSearchLocation] = useState(
    searchParams.get('search') || ''
  );
  const [openFilterPopup, setOpenFilterPopup] = useState<
    null | 'budget' | 'type' | 'standing' | 'amenities'
  >(null);
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(true);
  const [filters, setFilters] = useState({
    budget_min: searchParams.get('budget_min') || '',
    budget_max: searchParams.get('budget_max') || '',
    category_id: searchParams.getAll('category_id'),
    standing: searchParams.get('standing') || '',
    bedroom_min: searchParams.get('bedroom_min') || '',
    bedroom_max: searchParams.get('bedroom_max') || '',
    ad_type: searchParams.get('ad_type') || '',
    amenities: searchParams.getAll('amenities'),
  });

  const searchLabel = searchParams.get('search') || 'vos filtres';

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

  const requestParams = useMemo(() => {
    const params: Record<string, any> = {};

    searchParams.forEach((value, key) => {
      if (key === 'category_id' || key === 'amenities') {
        if (!params[key]) params[key] = [];
        params[key].push(value);
      } else {
        params[key] = value;
      }
    });

    params.page = 1;
    return params;
  }, [searchParams]);

  const radioOption = (checked: boolean) => (
    <span
      className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
        checked ? 'border-primary' : 'border-outline'
      }`}
    >
      <span className={`h-2 w-2 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-transparent'}`} />
    </span>
  );

  const renderFilterPopupContent = (
    popup: 'budget' | 'type' | 'standing' | 'amenities'
  ) => {
    return (
      <>
        {popup === 'budget' && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-on-surface'>Budget</h3>
            <p className='text-xs text-on-surface-variant'>Definissez votre fourchette</p>
            <div className='space-y-2'>
              <input
                type='number'
                placeholder='Prix minimum'
                value={filters.budget_min}
                onChange={e => handleFilterChange('budget_min', e.target.value)}
                className='h-10 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10'
              />
              <input
                type='number'
                placeholder='Prix maximum'
                value={filters.budget_max}
                onChange={e => handleFilterChange('budget_max', e.target.value)}
                className='h-10 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10'
              />
            </div>
          </div>
        )}

        {popup === 'type' && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-on-surface'>Type et categories</h3>
            <RadioGroup
              value={filters.ad_type}
              onChange={(value: string) => handleFilterChange('ad_type', value)}
              className='space-y-1.5'
            >
              {[
                { key: '', name: 'Tous' },
                { key: 'location', name: 'Location' },
                { key: 'sale', name: 'Vente' },
              ].map(type => (
                <RadioGroup.Option
                  key={type.key}
                  value={type.key}
                  className='flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-low'
                >
                  {({ checked }) => (
                    <>
                      {radioOption(checked)}
                      <span className='text-sm text-on-surface'>{type.name}</span>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
            <div className='max-h-40 space-y-1 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-low p-2'>
              {categories.map(category => (
                <Checkbox
                  key={category.id}
                  checked={filters.category_id.includes(category.id)}
                  onChange={(checked: boolean) => handleCategoryChange(category.id, checked)}
                  className='group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white'
                >
                  <span className='flex h-4 w-4 items-center justify-center rounded border border-outline bg-white group-data-[checked]:border-primary transition-colors'>
                    <svg viewBox='0 0 16 16' fill='none' className='hidden h-3 w-3 text-primary group-data-[checked]:block'>
                      <path d='M3 8.5L6.2 11.2L13 4.5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  </span>
                  <span className='text-sm text-on-surface'>{category.name}</span>
                </Checkbox>
              ))}
            </div>
          </div>
        )}

        {popup === 'standing' && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-on-surface'>Standing</h3>
            <RadioGroup
              value={filters.standing}
              onChange={(value: string) => handleFilterChange('standing', value)}
              className='space-y-1.5'
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
                  className='flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-low'
                >
                  {({ checked }) => (
                    <>
                      {radioOption(checked)}
                      <span className='text-sm text-on-surface'>{standing.name}</span>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </div>
        )}

        {popup === 'amenities' && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-on-surface'>Equipements</h3>
            <div className='grid grid-cols-1 gap-1'>
              {[
                { key: 'wifi', name: 'WiFi inclus' },
                { key: 'air_conditioning', name: 'Climatisation' },
                { key: 'security_24h', name: 'Sécurité 24h/24' },
                { key: 'equipped_kitchen', name: 'Cuisine équipée' },
                { key: 'smart_tv', name: 'Smart TV' },
                { key: 'gate', name: 'Portail' },
                { key: 'pool', name: 'Piscine' },
                { key: 'garage', name: 'Garage' },
                { key: 'furnitured', name: 'Meublé' },
              ].map(amenity => (
                <Checkbox
                  key={amenity.key}
                  checked={filters.amenities.includes(amenity.key)}
                  onChange={(checked: boolean) => handleAmenityChange(amenity.key, checked)}
                  className='group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-low'
                >
                  <span className='flex h-4 w-4 items-center justify-center rounded border border-outline bg-white group-data-[checked]:border-primary transition-colors'>
                    <svg viewBox='0 0 16 16' fill='none' className='hidden h-3 w-3 text-primary group-data-[checked]:block'>
                      <path d='M3 8.5L6.2 11.2L13 4.5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  </span>
                  <span className='text-sm text-on-surface'>{amenity.name}</span>
                </Checkbox>
              ))}
            </div>
          </div>
        )}

        <div className='mt-4 flex items-center justify-end gap-2 border-t border-outline-variant pt-3'>
          <button
            type='button'
            onClick={resetFilters}
            className='rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-outline hover:text-on-surface'
          >
            Réinitialiser
          </button>
          <button
            type='button'
            onClick={handleApplySearch}
            className='rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-light'
          >
            Appliquer
          </button>
        </div>
      </>
    );
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories('house');
        setCategories(categoriesData);
      } catch {
        // silent
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    setSearchLocation(searchParams.get('search') || '');
    setFilters({
      budget_min: searchParams.get('budget_min') || '',
      budget_max: searchParams.get('budget_max') || '',
      category_id: searchParams.getAll('category_id'),
      standing: searchParams.get('standing') || '',
      bedroom_min: searchParams.get('bedroom_min') || '',
      bedroom_max: searchParams.get('bedroom_max') || '',
      ad_type: searchParams.get('ad_type') || '',
      amenities: searchParams.getAll('amenities'),
    });
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const response: any = await getAds(requestParams);
        const responseData = Array.isArray(response) ? response : response.data || [];
        if (!cancelled) setAds(responseData);
      } catch {
        if (!cancelled) setAds([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [requestParams]);

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      category_id: checked
        ? [...prev.category_id, categoryId]
        : prev.category_id.filter(id => id !== categoryId),
    }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity),
    }));
  };

  const handleLocationSelect = (location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  }) => {
    setSearchLocation(location.city || location.address);
  };

  const handleApplySearch = () => {
    const params = new URLSearchParams();

    if (searchLocation.trim()) params.set('search', searchLocation.trim());

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) value.forEach(v => params.append(key, v));
      } else if (value && value.toString().trim()) {
        params.set(key, value.toString());
      }
    });

    navigate(`/search?${params.toString()}`, { replace: true });
    setOpenFilterPopup(null);
  };

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
  };

  const popupPanelClass =
    'absolute z-40 rounded-2xl border border-outline-variant bg-white p-4 shadow-card-hover ring-1 ring-black/5';

  return (
    <>
      <Nav2
        links={[{ name: 'Acheter', url: '/subscriptions' }]}
        highlightBuyLink
      />

      {/* ── Filter bar ── */}
      <div className='sticky top-[calc(5rem+var(--email-verification-banner-offset,0px))] z-20 w-screen px-4 py-3 backdrop-blur-sm sm:px-6 md:fixed md:top-[calc(5rem+var(--email-verification-banner-offset,0px))] lg:px-8'>
        <div className='mx-auto w-full max-w-6xl'>
          <div className='relative'>

            {/* ── Mobile filter card ── */}
            <div className='overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-card md:hidden'>
              <div className='flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3'>
                <div className='min-w-0'>
                  <span className='block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant'>
                    Filtres actifs
                  </span>
                  <span className='block truncate text-sm font-semibold text-on-surface'>
                    {searchLocation || 'Localisation'} · {adTypeSummary}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => { setMobileFiltersExpanded(v => !v); setOpenFilterPopup(null); }}
                  className='flex-shrink-0 rounded-xl border border-outline-variant bg-white px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low'
                >
                  {mobileFiltersExpanded ? 'Réduire' : 'Modifier'}
                </button>
              </div>

              {mobileFiltersExpanded && (
                <div className='divide-y divide-outline-variant/60'>
                  {/* Location */}
                  <div className='flex items-center gap-3 px-4 py-3.5'>
                    <span className='h-3.5 w-3.5 flex-shrink-0 rounded-full border-[3px] border-primary' />
                    <div className='min-w-0 flex-1'>
                      <span className='block text-xs font-semibold text-on-surface-variant'>Localisation</span>
                      <AddressAutocomplete
                        value={searchLocation}
                        onChange={setSearchLocation}
                        onLocationSelect={handleLocationSelect}
                        placeholder='Rechercher une localisation'
                        className='h-5 w-full border-0 bg-transparent p-0 text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-0 focus:ring-0'
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <button
                    type='button'
                    onClick={() => setOpenFilterPopup(c => c === 'budget' ? null : 'budget')}
                    className='flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'
                  >
                    <span className='h-3.5 w-3.5 flex-shrink-0 rounded-full border-[3px] border-outline' />
                    <span className='min-w-0 flex-1'>
                      <span className='block text-xs font-semibold text-on-surface-variant'>Budget</span>
                      <span className='block truncate text-sm font-medium text-on-surface'>{budgetSummary}</span>
                    </span>
                    {(filters.budget_min || filters.budget_max) && (
                      <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />
                    )}
                  </button>

                  {/* Type + Standing */}
                  <div className='grid grid-cols-2 divide-x divide-outline-variant/60'>
                    <button
                      type='button'
                      onClick={() => setOpenFilterPopup(c => c === 'type' ? null : 'type')}
                      className='flex items-center gap-2 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'
                    >
                      <span className='min-w-0 flex-1'>
                        <span className='block truncate text-xs font-semibold text-on-surface-variant'>Type</span>
                        <span className='block truncate text-sm font-medium text-on-surface'>{adTypeSummary}</span>
                        <span className='block truncate text-[11px] text-on-surface-variant'>{filterSummary}</span>
                      </span>
                      {filters.ad_type && <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />}
                    </button>
                    <button
                      type='button'
                      onClick={() => setOpenFilterPopup(c => c === 'standing' ? null : 'standing')}
                      className='flex items-center gap-2 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'
                    >
                      <span className='min-w-0 flex-1'>
                        <span className='block text-xs font-semibold text-on-surface-variant'>Standing</span>
                        <span className='block truncate text-sm font-medium text-on-surface'>{standingSummary}</span>
                      </span>
                      {filters.standing && <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />}
                    </button>
                  </div>

                  {/* Amenities */}
                  <button
                    type='button'
                    onClick={() => setOpenFilterPopup(c => c === 'amenities' ? null : 'amenities')}
                    className='flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'
                  >
                    <span className='h-3.5 w-3.5 flex-shrink-0 rounded-full border-[3px] border-outline' />
                    <span className='min-w-0 flex-1'>
                      <span className='block text-xs font-semibold text-on-surface-variant'>Équipements</span>
                      <span className='block truncate text-sm font-medium text-on-surface'>{amenitiesSummary}</span>
                    </span>
                    {filters.amenities.length > 0 && (
                      <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />
                    )}
                  </button>
                </div>
              )}

              <button
                type='button'
                onClick={handleApplySearch}
                className='w-full bg-primary px-4 py-4 text-sm font-bold text-white transition-colors hover:bg-primary-light'
              >
                {mobileFiltersExpanded ? 'Rechercher' : 'Rechercher avec ces filtres'}
              </button>
            </div>

            {/* Mobile popup */}
            {openFilterPopup && (
              <div className={`${popupPanelClass} left-0 right-0 top-[calc(100%+8px)] mx-auto w-[92vw] max-w-sm md:hidden`}>
                {renderFilterPopupContent(openFilterPopup)}
              </div>
            )}

            {/* ── Desktop search bar ── */}
            <div className='hidden items-center rounded-full border border-outline-variant bg-white px-3 py-1 shadow-card transition-shadow hover:shadow-card-hover md:flex'>

              {/* Location */}
              <div className='flex h-[52px] min-w-0 flex-1 flex-col justify-center px-5'>
                <span className='block text-xs font-semibold text-on-surface'>Localisation</span>
                <AddressAutocomplete
                  value={searchLocation}
                  onChange={setSearchLocation}
                  onLocationSelect={handleLocationSelect}
                  placeholder='Rechercher une localisation'
                  className='h-5 w-full border-0 bg-transparent p-0 text-sm leading-5 text-on-surface-variant outline-none placeholder:text-on-surface-variant/50 focus:border-0 focus:ring-0'
                />
              </div>

              <div className='hidden h-8 w-px bg-outline-variant md:block' />

              {/* Budget */}
              <div className='relative hidden min-w-0 flex-1 md:block'>
                <button
                  type='button'
                  onClick={() => setOpenFilterPopup(c => c === 'budget' ? null : 'budget')}
                  className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'
                >
                  <span className='block text-xs font-semibold text-on-surface'>Budget</span>
                  <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>
                    {budgetSummary}
                    {(filters.budget_min || filters.budget_max) && (
                      <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />
                    )}
                  </span>
                </button>
                {openFilterPopup === 'budget' && (
                  <div className={`${popupPanelClass} left-0 top-[calc(100%+8px)] w-72 max-w-[90vw]`}>
                    {renderFilterPopupContent('budget')}
                  </div>
                )}
              </div>

              <div className='hidden h-8 w-px bg-outline-variant md:block' />

              {/* Type */}
              <div className='relative hidden min-w-0 flex-1 md:block'>
                <button
                  type='button'
                  onClick={() => setOpenFilterPopup(c => c === 'type' ? null : 'type')}
                  className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'
                >
                  <span className='block text-xs font-semibold text-on-surface'>Type et categories</span>
                  <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>
                    {adTypeSummary} · {filterSummary}
                    {filters.ad_type && <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />}
                  </span>
                </button>
                {openFilterPopup === 'type' && (
                  <div className={`${popupPanelClass} left-0 top-[calc(100%+8px)] w-80 max-w-[90vw]`}>
                    {renderFilterPopupContent('type')}
                  </div>
                )}
              </div>

              <div className='hidden h-8 w-px bg-outline-variant lg:block' />

              {/* Standing */}
              <div className='relative hidden min-w-0 flex-1 lg:block'>
                <button
                  type='button'
                  onClick={() => setOpenFilterPopup(c => c === 'standing' ? null : 'standing')}
                  className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'
                >
                  <span className='block text-xs font-semibold text-on-surface'>Standing</span>
                  <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>
                    {standingSummary}
                    {filters.standing && <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />}
                  </span>
                </button>
                {openFilterPopup === 'standing' && (
                  <div className={`${popupPanelClass} left-0 top-[calc(100%+8px)] w-72 max-w-[90vw]`}>
                    {renderFilterPopupContent('standing')}
                  </div>
                )}
              </div>

              <div className='hidden h-8 w-px bg-outline-variant lg:block' />

              {/* Amenities */}
              <div className='relative hidden min-w-0 flex-1 lg:block'>
                <button
                  type='button'
                  onClick={() => setOpenFilterPopup(c => c === 'amenities' ? null : 'amenities')}
                  className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'
                >
                  <span className='block text-xs font-semibold text-on-surface'>Equipements</span>
                  <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>
                    {amenitiesSummary}
                    {filters.amenities.length > 0 && (
                      <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />
                    )}
                  </span>
                </button>
                {openFilterPopup === 'amenities' && (
                  <div className={`${popupPanelClass} right-0 top-[calc(100%+8px)] w-72 max-w-[90vw]`}>
                    {renderFilterPopupContent('amenities')}
                  </div>
                )}
              </div>

              {/* Search button */}
              <button
                type='button'
                onClick={handleApplySearch}
                className='relative ml-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary-light'
                title='Rechercher'
              >
                <MdSearch size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className='min-h-screen'>
        {(isLoading || ads.length > 0) && (
          <div className='mt-8 px-5 text-center md:mt-40 sm:px-8 lg:px-12'>
            <h2 className='text-2xl font-bold leading-tight text-on-surface sm:text-3xl lg:text-4xl'>
              Résultats pour{' '}
              <span className='relative inline-block pb-3 font-bold text-primary'>
                {searchLabel}
                <span
                  className='absolute inset-x-0 bottom-0 h-4 bg-[url(/filter-double-underline.svg)] bg-contain bg-center bg-no-repeat'
                  aria-hidden='true'
                />
              </span>
            </h2>
          </div>
        )}

        {isLoading ? (
          <SearchSkeleton />
        ) : ads.length > 0 ? (
          <section className='mt-4 grid w-full grid-cols-1 gap-x-4 gap-y-6 px-5 py-6 sm:grid-cols-2 sm:gap-x-6 sm:px-8 lg:grid-cols-3 lg:px-12 xl:grid-cols-4'>
            {ads.map(ad => (
              <ProductCard {...ad} key={ad.id} />
            ))}
          </section>
        ) : (
          <EmptySearchState />
        )}
      </div>
      <FooterMinimal />
    </>
  );
}
