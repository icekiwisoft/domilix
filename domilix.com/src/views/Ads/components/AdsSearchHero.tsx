import AddressAutocomplete from '@components/AddressAutocomplete/AddressAutocomplete';
import { Checkbox, RadioGroup } from '@headlessui/react';
import { useNavigate } from '@router';
import { getCategories } from '@services/announceApi';
import { useEffect, useState } from 'react';
import { HiAdjustmentsHorizontal, HiBuildingOffice2, HiCurrencyDollar, HiMapPin, HiStar } from 'react-icons/hi2';
import { MdSearch } from 'react-icons/md';

type FilterPopup = 'budget' | 'type' | 'standing' | 'amenities';

type Filters = {
  budget_min: string;
  budget_max: string;
  category_id: string[];
  standing: string;
  bedroom_min: string;
  bedroom_max: string;
  ad_type: string;
  amenities: string[];
};

const emptyFilters: Filters = {
  budget_min: '',
  budget_max: '',
  category_id: [],
  standing: '',
  bedroom_min: '',
  bedroom_max: '',
  ad_type: '',
  amenities: [],
};

const amenities = [
  { key: 'wifi', name: 'WiFi inclus' },
  { key: 'air_conditioning', name: 'Climatisation' },
  { key: 'security_24h', name: 'Sécurité 24h/24' },
  { key: 'equipped_kitchen', name: 'Cuisine équipée' },
  { key: 'smart_tv', name: 'Smart TV' },
  { key: 'gate', name: 'Portail' },
  { key: 'pool', name: 'Piscine' },
  { key: 'garage', name: 'Garage' },
  { key: 'furnitured', name: 'Meublé' },
];

export default function AdsSearchHero() {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [openFilterPopup, setOpenFilterPopup] = useState<FilterPopup | null>(null);
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(true);

  useEffect(() => {
    getCategories('house').then(setCategories).catch(() => undefined);
  }, []);

  const handleFilterChange = (filterName: keyof Filters, value: any) => {
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
        : prev.amenities.filter(item => item !== amenity),
    }));
  };

  const submitSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation.trim()) params.set('search', searchLocation.trim());

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => params.append(key, item));
      } else if (value.trim()) {
        params.set(key, value);
      }
    });

    const query = params.toString();
    navigate(query ? `/search?${query}` : '/search');
  };

  const resetFilters = () => setFilters(emptyFilters);
  const closePopup = () => setOpenFilterPopup(null);

  const budgetSummary = filters.budget_min || filters.budget_max
    ? `${filters.budget_min || '0'} - ${filters.budget_max || '...'} FCFA`
    : 'Definir un budget';
  const typeSummary = filters.ad_type === 'location' ? 'Location' : filters.ad_type === 'sale' ? 'Vente' : 'Tous types';
  const categorySummary = filters.category_id.length ? `${filters.category_id.length} categorie${filters.category_id.length > 1 ? 's' : ''}` : 'Aucune categorie';
  const standingSummary = filters.standing === 'standard'
    ? 'Standard'
    : filters.standing === 'confort'
      ? 'Confort'
      : filters.standing === 'haut_standing'
        ? 'Haut Standing'
        : 'Tous niveaux';
  const amenitiesSummary = filters.amenities.length ? `${filters.amenities.length} equipement${filters.amenities.length > 1 ? 's' : ''}` : 'Aucun equipement';

  const radioOption = (checked: boolean) => (
    <span className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${checked ? 'border-primary' : 'border-outline'}`}>
      <span className={`h-2 w-2 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-transparent'}`} />
    </span>
  );

  const checkboxIcon = (
    <svg viewBox='0 0 16 16' fill='none' className='hidden h-3 w-3 text-primary group-data-[checked]:block'>
      <path d='M3 8.5L6.2 11.2L13 4.5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );

  const renderFilterPopupContent = (popup: FilterPopup) => (
    <>
      {popup === 'budget' && (
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-semibold text-on-surface'>Budget</h3>
            <p className='mt-0.5 text-xs text-on-surface-variant'>Fourchette de prix en FCFA</p>
          </div>

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-medium text-on-surface-variant'>Minimum</span>
              <span className='font-bold text-on-surface'>{filters.budget_min ? Number(filters.budget_min).toLocaleString('fr-FR') : '0'} FCFA</span>
            </div>
            <input
              type='range'
              min='0'
              max='10000000'
              step='50000'
              value={filters.budget_min || 0}
              onChange={event => handleFilterChange('budget_min', event.target.value === '0' ? '' : event.target.value)}
              className='h-1.5 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer'
              style={{
                background: `linear-gradient(to right, #E8921A 0%, #E8921A ${((Number(filters.budget_min) || 0) / 10000000) * 100}%, #D5C3B9 ${((Number(filters.budget_min) || 0) / 10000000) * 100}%, #D5C3B9 100%)`,
              }}
            />
            <div className='flex justify-between text-[10px] text-on-surface-variant'>
              <span>0</span>
              <span>10 000 000</span>
            </div>
          </div>

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-medium text-on-surface-variant'>Maximum</span>
              <span className='font-bold text-on-surface'>{filters.budget_max ? `${Number(filters.budget_max).toLocaleString('fr-FR')} FCFA` : 'Illimité'}</span>
            </div>
            <input
              type='range'
              min='0'
              max='10000000'
              step='50000'
              value={filters.budget_max || 10000000}
              onChange={event => handleFilterChange('budget_max', event.target.value === '10000000' ? '' : event.target.value)}
              className='h-1.5 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer'
              style={{
                background: `linear-gradient(to right, #E8921A 0%, #E8921A ${((Number(filters.budget_max) || 10000000) / 10000000) * 100}%, #D5C3B9 ${((Number(filters.budget_max) || 10000000) / 10000000) * 100}%, #D5C3B9 100%)`,
              }}
            />
            <div className='flex justify-between text-[10px] text-on-surface-variant'>
              <span>0</span>
              <span>10M+</span>
            </div>
          </div>

          <div>
            <p className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant'>Raccourcis</p>
            <div className='flex flex-wrap gap-1.5'>
              {[
                { label: '< 100k', max: '100000' },
                { label: '< 300k', max: '300000' },
                { label: '< 500k', max: '500000' },
                { label: '< 1M', max: '1000000' },
                { label: '< 5M', max: '5000000' },
              ].map(preset => (
                <button
                  key={preset.label}
                  type='button'
                  onClick={() => handleFilterChange('budget_max', preset.max)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${filters.budget_max === preset.max ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-white text-on-surface-variant hover:border-primary/40 hover:text-primary'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {popup === 'type' && (
        <div className='space-y-3'>
          <h3 className='text-sm font-semibold text-on-surface'>Type et categories</h3>
          <RadioGroup value={filters.ad_type} onChange={(value: string) => handleFilterChange('ad_type', value)} className='space-y-1.5'>
            {[
              { key: '', name: 'Tous' },
              { key: 'location', name: 'Location' },
              { key: 'sale', name: 'Vente' },
            ].map(type => (
              <RadioGroup.Option key={type.key} value={type.key} className='flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-low'>
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
                <span className='flex h-4 w-4 items-center justify-center rounded border border-outline bg-white transition-colors group-data-[checked]:border-primary'>{checkboxIcon}</span>
                <span className='text-sm text-on-surface'>{category.name}</span>
              </Checkbox>
            ))}
          </div>
        </div>
      )}

      {popup === 'standing' && (
        <div className='space-y-3'>
          <h3 className='text-sm font-semibold text-on-surface'>Standing</h3>
          <RadioGroup value={filters.standing} onChange={(value: string) => handleFilterChange('standing', value)} className='space-y-1.5'>
            {[
              { key: '', name: 'Tous' },
              { key: 'standard', name: 'Standard' },
              { key: 'confort', name: 'Confort' },
              { key: 'haut_standing', name: 'Haut Standing' },
            ].map(standing => (
              <RadioGroup.Option key={standing.key} value={standing.key} className='flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-low'>
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
            {amenities.map(amenity => (
              <Checkbox
                key={amenity.key}
                checked={filters.amenities.includes(amenity.key)}
                onChange={(checked: boolean) => handleAmenityChange(amenity.key, checked)}
                className='group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-low'
              >
                <span className='flex h-4 w-4 items-center justify-center rounded border border-outline bg-white transition-colors group-data-[checked]:border-primary'>{checkboxIcon}</span>
                <span className='text-sm text-on-surface'>{amenity.name}</span>
              </Checkbox>
            ))}
          </div>
        </div>
      )}

      <div className='mt-4 flex items-center justify-end gap-2 border-t border-outline-variant pt-3'>
        <button type='button' onClick={resetFilters} className='rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-outline hover:text-on-surface'>Réinitialiser</button>
        <button type='button' onClick={closePopup} className='rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-light'>Appliquer</button>
      </div>
    </>
  );

  const popupPanelClass = 'absolute z-40 rounded-2xl border border-outline-variant bg-white p-4 shadow-card-hover ring-1 ring-black/5';

  return (
    <section className='sticky top-[calc(4rem+var(--email-verification-banner-offset,0px))] z-30 mx-auto w-full max-w-container bg-background/95 px-gutter pb-4 pt-2 text-center sm:top-[calc(5rem+var(--email-verification-banner-offset,0px))]'>
      <div className='relative mx-auto w-full max-w-[1000px] text-left'>
        <div className='overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-card md:hidden'>
          <div className='flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3'>
            <div className='min-w-0 text-left'>
              <span className='block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant'>Recherche</span>
              <span className='block truncate text-sm font-semibold text-on-surface'>{searchLocation || 'Toute localisation'} · {typeSummary}</span>
            </div>
            <button type='button' onClick={() => { setMobileFiltersExpanded(value => !value); setOpenFilterPopup(null); }} className='flex items-center gap-1.5 rounded-xl border border-outline-variant bg-white px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low'>
              <HiAdjustmentsHorizontal className='h-3.5 w-3.5' />
              {mobileFiltersExpanded ? 'Réduire' : 'Filtres'}
            </button>
          </div>

          {mobileFiltersExpanded && (
            <div className='divide-y divide-outline-variant/60'>
              <div className='flex items-center gap-3 px-4 py-3.5'>
                <HiMapPin className='h-4 w-4 flex-shrink-0 text-primary' />
                <div className='min-w-0 flex-1 text-left'>
                  <span className='block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant'>Localisation</span>
                  <AddressAutocomplete value={searchLocation} onChange={setSearchLocation} onLocationSelect={location => setSearchLocation(location.city || location.address)} placeholder='Ville, quartier…' className='h-5 w-full border-0 bg-transparent p-0 text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-0 focus:ring-0' />
                </div>
              </div>

              <button type='button' onClick={() => setOpenFilterPopup(value => value === 'budget' ? null : 'budget')} className='flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'>
                <HiCurrencyDollar className='h-4 w-4 flex-shrink-0 text-on-surface-variant' />
                <span className='min-w-0 flex-1'><span className='block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant'>Budget</span><span className='block truncate text-sm font-medium text-on-surface'>{budgetSummary}</span></span>
                {(filters.budget_min || filters.budget_max) && <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />}
              </button>

              <div className='grid grid-cols-2 divide-x divide-outline-variant/60'>
                <button type='button' onClick={() => setOpenFilterPopup(value => value === 'type' ? null : 'type')} className='flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'>
                  <HiBuildingOffice2 className='h-4 w-4 flex-shrink-0 text-on-surface-variant' />
                  <span className='min-w-0 flex-1'><span className='block truncate text-sm font-medium text-on-surface'>{typeSummary}</span><span className='block truncate text-[11px] text-on-surface-variant'>{categorySummary}</span></span>
                  {filters.ad_type && <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />}
                </button>
                <button type='button' onClick={() => setOpenFilterPopup(value => value === 'standing' ? null : 'standing')} className='flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'>
                  <HiStar className='h-4 w-4 flex-shrink-0 text-on-surface-variant' />
                  <span className='min-w-0 flex-1'><span className='block text-sm font-medium text-on-surface'>Standing</span><span className='block truncate text-[11px] text-on-surface-variant'>{standingSummary}</span></span>
                  {filters.standing && <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />}
                </button>
              </div>

              <button type='button' onClick={() => setOpenFilterPopup(value => value === 'amenities' ? null : 'amenities')} className='flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'>
                <HiAdjustmentsHorizontal className='h-4 w-4 flex-shrink-0 text-on-surface-variant' />
                <span className='min-w-0 flex-1'><span className='block text-sm font-medium text-on-surface'>Équipements</span><span className='block truncate text-[11px] text-on-surface-variant'>{amenitiesSummary}</span></span>
                {filters.amenities.length > 0 && <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />}
              </button>
            </div>
          )}

          <button type='button' onClick={submitSearch} className='w-full bg-primary px-4 py-4 text-center text-sm font-bold text-white transition-colors hover:bg-primary-light'>Lancer la recherche</button>
        </div>

        {openFilterPopup && (
          <div className='fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm md:hidden' onClick={closePopup}>
            <div className='max-h-[82vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-outline-variant bg-white p-4 shadow-card-hover ring-1 ring-black/5' onClick={event => event.stopPropagation()}>
              {renderFilterPopupContent(openFilterPopup)}
            </div>
          </div>
        )}

        <div className='hidden items-center rounded-full border border-outline-variant bg-white px-3 py-1 shadow-card transition-shadow hover:shadow-card-hover md:flex'>
          <div className='flex h-[52px] min-w-0 flex-1 flex-col justify-center rounded-full px-5'>
            <span className='block text-xs font-semibold text-on-surface'>Localisation</span>
            <AddressAutocomplete value={searchLocation} onChange={setSearchLocation} onLocationSelect={location => setSearchLocation(location.city || location.address)} placeholder='Rechercher une localisation' className='h-5 w-full border-0 bg-transparent p-0 text-sm leading-5 text-on-surface-variant outline-none placeholder:text-on-surface-variant/50 focus:border-0 focus:ring-0' />
          </div>

          <div className='hidden h-8 w-px bg-outline-variant md:block' />

          <div className='relative hidden min-w-0 flex-1 md:block'>
            <button type='button' onClick={() => setOpenFilterPopup(value => value === 'budget' ? null : 'budget')} className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'>
              <span className='block text-xs font-semibold text-on-surface'>Budget</span>
              <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>{budgetSummary}{(filters.budget_min || filters.budget_max) && <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />}</span>
            </button>
            {openFilterPopup === 'budget' && <div className={`${popupPanelClass} left-0 top-[calc(100%+8px)] w-72 max-w-[90vw]`}>{renderFilterPopupContent('budget')}</div>}
          </div>

          <div className='hidden h-8 w-px bg-outline-variant md:block' />

          <div className='relative hidden min-w-0 flex-1 md:block'>
            <button type='button' onClick={() => setOpenFilterPopup(value => value === 'type' ? null : 'type')} className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'>
              <span className='block text-xs font-semibold text-on-surface'>Type et categories</span>
              <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>{typeSummary} · {categorySummary}{filters.ad_type && <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />}</span>
            </button>
            {openFilterPopup === 'type' && <div className={`${popupPanelClass} left-0 top-[calc(100%+8px)] w-80 max-w-[90vw]`}>{renderFilterPopupContent('type')}</div>}
          </div>

          <div className='hidden h-8 w-px bg-outline-variant lg:block' />

          <div className='relative hidden min-w-0 flex-1 lg:block'>
            <button type='button' onClick={() => setOpenFilterPopup(value => value === 'standing' ? null : 'standing')} className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'>
              <span className='block text-xs font-semibold text-on-surface'>Standing</span>
              <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>{standingSummary}{filters.standing && <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />}</span>
            </button>
            {openFilterPopup === 'standing' && <div className={`${popupPanelClass} left-0 top-[calc(100%+8px)] w-72 max-w-[90vw]`}>{renderFilterPopupContent('standing')}</div>}
          </div>

          <div className='hidden h-8 w-px bg-outline-variant lg:block' />

          <div className='relative hidden min-w-0 flex-1 lg:block'>
            <button type='button' onClick={() => setOpenFilterPopup(value => value === 'amenities' ? null : 'amenities')} className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'>
              <span className='block text-xs font-semibold text-on-surface'>Equipements</span>
              <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>{amenitiesSummary}{filters.amenities.length > 0 && <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />}</span>
            </button>
            {openFilterPopup === 'amenities' && <div className={`${popupPanelClass} right-0 top-[calc(100%+8px)] w-72 max-w-[90vw]`}>{renderFilterPopupContent('amenities')}</div>}
          </div>

          <button type='button' onClick={submitSearch} className='relative ml-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary-light' title='Rechercher'>
            <MdSearch size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
