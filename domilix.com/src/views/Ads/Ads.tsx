import Nav2 from '@components/Nav2/Nav2';
import FooterMinimal from '@components/FooterMinimal/FooterMinimal';
import ProductCard from '@components/ProductCard/ProductCard';
import AddressAutocomplete from '@components/AddressAutocomplete/AddressAutocomplete';
import housesPromoImg from '@assets/default-img/houses.jpg';
import furnituresPromoImg from '@assets/default-img/furnitures.jpg';
import coverAnnonceurImg from '@assets/bg_img/cover_annonceur.jpg';
import homePromoImg from '@assets/img/home.jpg';
import { Checkbox, RadioGroup } from '@headlessui/react';
import { getAds, getBroadcasts, getCategories, getCities, CityItem, BroadcastItem } from '@services/announceApi';
import { Ad } from '@utils/types';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import { MdSearch } from 'react-icons/md';
import { HiMapPin, HiAdjustmentsHorizontal, HiCurrencyDollar, HiBuildingOffice2, HiStar } from 'react-icons/hi2';
import { useNavigate } from '@router';

type PromoSlide = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  chip?: string;
  cta: string;
  bg: string;
  image: string;
  actionUrl?: string;
};

function AdsSkeleton() {
  return (
    <div className='space-y-10'>
      {[0, 1].map(section => (
        <section key={section} className='space-y-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='h-6 w-40 animate-pulse rounded-full bg-surface-container-high' />
            <div className='h-7 w-24 animate-pulse rounded-full bg-surface-container-high' />
          </div>
          <div className='grid w-full grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-4 xl:grid-cols-4 2xl:grid-cols-5'>
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
          </div>
        </section>
      ))}
    </div>
  );
}

function EmptyAdsState() {
  return (
    <div className='flex min-h-[48vh] items-center justify-center px-5 py-16 text-center sm:px-8 lg:px-12'>
      <div className='max-w-md'>
        <div className='mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-primary/10 text-primary'>
          <svg viewBox='0 0 120 120' className='h-20 w-20' fill='none' aria-hidden='true'>
            <path d='M24 51 60 25l36 26v40a5 5 0 0 1-5 5H29a5 5 0 0 1-5-5V51Z' fill='currentColor' fillOpacity='0.08' stroke='currentColor' strokeWidth='5' strokeLinejoin='round' />
            <path d='M48 96V67h24v29M38 52h44' stroke='currentColor' strokeWidth='5' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M91 30 102 19M100 41h14M20 24l9 9' stroke='currentColor' strokeOpacity='0.4' strokeWidth='5' strokeLinecap='round' />
            <circle cx='24' cy='86' r='5' fill='currentColor' />
            <circle cx='96' cy='86' r='4' fill='currentColor' fillOpacity='0.4' />
          </svg>
        </div>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-primary'>Aucun résultat</p>
        <h2 className='mt-3 text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
          Aucune annonce mise en avant pour le moment
        </h2>
        <p className='mt-3 text-sm leading-6 text-on-surface-variant'>
          Revenez un peu plus tard ou lancez une recherche pour trouver les annonces disponibles.
        </p>
      </div>
    </div>
  );
}

function AdsErrorState() {
  return (
    <div className='flex min-h-[48vh] items-center justify-center px-5 py-16 text-center sm:px-8 lg:px-12'>
      <div className='max-w-md'>
        <div className='mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-error/10 text-error'>
          <svg viewBox='0 0 120 120' className='h-20 w-20' fill='none' aria-hidden='true'>
            <path d='M24 70 60 23l36 47v28H24V70Z' fill='currentColor' fillOpacity='0.08' stroke='currentColor' strokeWidth='5' strokeLinejoin='round' />
            <path d='M60 46v23' stroke='currentColor' strokeWidth='7' strokeLinecap='round' />
            <circle cx='60' cy='82' r='4' fill='currentColor' />
            <path d='M30 28 20 18M93 29l10-10M15 54H4M116 54h-11' stroke='currentColor' strokeOpacity='0.4' strokeWidth='5' strokeLinecap='round' />
          </svg>
        </div>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-error'>Erreur serveur</p>
        <h2 className='mt-3 text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
          Impossible de charger les annonces
        </h2>
        <p className='mt-3 text-sm leading-6 text-on-surface-variant'>
          Une erreur interne est survenue. Veuillez réessayer dans quelques instants.
        </p>
      </div>
    </div>
  );
}

export default function Ads(): React.ReactElement {
  const housesPromoSrc =
    typeof housesPromoImg === 'string' ? housesPromoImg : housesPromoImg.src;
  const furnituresPromoSrc =
    typeof furnituresPromoImg === 'string' ? furnituresPromoImg : furnituresPromoImg.src;
  const coverAnnonceurSrc =
    typeof coverAnnonceurImg === 'string' ? coverAnnonceurImg : coverAnnonceurImg.src;
  const homePromoSrc =
    typeof homePromoImg === 'string' ? homePromoImg : homePromoImg.src;

  const defaultPromoSlides: PromoSlide[] = [
    {
      id: 'promo-publier-gratuit',
      chip: 'Propriétaires',
      badge: '100% Gratuit',
      title: 'Publiez Votre Bien Gratuitement',
      subtitle: 'Première annonce sans frais pour attirer vos premiers clients.',
      cta: 'Publier maintenant',
      bg: 'from-orange-600 to-rose-500',
      image: coverAnnonceurSrc,
    },
    {
      id: 'promo-boost-annonce',
      chip: 'Visibilité',
      badge: '50% OFF',
      title: 'Boostez Votre Annonce',
      subtitle: 'Mettez votre annonce en tête des recherches pendant 7 jours.',
      cta: 'Activer le boost',
      bg: 'from-amber-500 to-orange-600',
      image: housesPromoSrc,
    },
    {
      id: 'promo-pack-pro',
      chip: 'Agences',
      badge: '35% OFF',
      title: 'Pack Pro Agence',
      subtitle: 'Publiez en illimité et obtenez plus de visibilité chaque semaine.',
      cta: 'Voir le pack pro',
      bg: 'from-rose-600 to-pink-600',
      image: furnituresPromoSrc,
    },
    {
      id: 'promo-photo-pro',
      chip: 'Premium',
      badge: '20% OFF',
      title: 'Photos Pro + Vérification',
      subtitle: 'Donnez plus de confiance à vos annonces et vendez plus vite.',
      cta: 'Découvrir le service',
      bg: 'from-orange-700 to-amber-600',
      image: homePromoSrc,
    },
  ];

  const [citySections, setCitySections] = useState<
    Array<{ city: string; country?: string; adsCount?: number; ads: Ad[] }>
  >([]);
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>(defaultPromoSlides);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [openFilterPopup, setOpenFilterPopup] = useState<
    null | 'budget' | 'type' | 'standing' | 'amenities'
  >(null);
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(true);
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
  const navigate = useNavigate();

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

  const popupPanelClass = 'absolute z-40 rounded-2xl border border-outline-variant bg-white p-4 shadow-card-hover ring-1 ring-black/5';

  const renderFilterPopupContent = (popup: 'budget' | 'type' | 'standing' | 'amenities') => {
    return (
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
                <span className='font-bold text-on-surface'>
                  {filters.budget_min ? Number(filters.budget_min).toLocaleString('fr-FR') : '0'} FCFA
                </span>
              </div>
              <input
                type='range'
                min='0'
                max='10000000'
                step='50000'
                value={filters.budget_min || 0}
                onChange={e => handleFilterChange('budget_min', e.target.value === '0' ? '' : e.target.value)}
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
                <span className='font-bold text-on-surface'>
                  {filters.budget_max ? Number(filters.budget_max).toLocaleString('fr-FR') + ' FCFA' : 'Illimité'}
                </span>
              </div>
              <input
                type='range'
                min='0'
                max='10000000'
                step='50000'
                value={filters.budget_max || 10000000}
                onChange={e => handleFilterChange('budget_max', e.target.value === '10000000' ? '' : e.target.value)}
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
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${filters.budget_max === preset.max
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant bg-white text-on-surface-variant hover:border-primary/40 hover:text-primary'
                      }`}
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
                  <span className='flex h-4 w-4 items-center justify-center rounded border border-outline bg-white transition-colors group-data-[checked]:border-primary'>
                    {checkboxIcon}
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
                  <span className='flex h-4 w-4 items-center justify-center rounded border border-outline bg-white transition-colors group-data-[checked]:border-primary'>
                    {checkboxIcon}
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
            onClick={applyFilters}
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
    const loadBroadcasts = async () => {
      try {
        const items = await getBroadcasts();
        if (!items.length) return;

        setPromoSlides(
          items.map((item: BroadcastItem) => ({
            id: `broadcast-${item.id}`,
            title: item.title,
            subtitle: item.subtitle || '',
            badge: item.badge || 'Promo',
            cta: item.cta || 'Voir plus',
            bg: item.bg || 'from-orange-500 to-rose-500',
            image: item.image || coverAnnonceurSrc,
            actionUrl: item.action_url || undefined,
          })),
        );
      } catch {
        // silent
      }
    };

    loadBroadcasts();
  }, [coverAnnonceurSrc]);

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
  };

  const handleSearchChange = (value: string) => {
    setSearchLocation(value);
  };

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

  const applyFilters = () => {
    setOpenFilterPopup(null);
  };

  const buildSearchParams = () => {
    const newSearchParams = new URLSearchParams();

    if (searchLocation.trim()) newSearchParams.set('search', searchLocation.trim());

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) value.forEach(v => newSearchParams.append(key, v));
      } else if (value && value.toString().trim()) {
        newSearchParams.set(key, value.toString());
      }
    });

    return newSearchParams;
  };

  const handleSearchSubmit = () => {
    const params = buildSearchParams();
    const query = params.toString();
    navigate(query ? `/search?${query}` : '/search');
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

  useEffect(() => {
    let cancelled = false;

    const loadAdsByCity = async () => {
      setIsLoading(true);
      setServerError(false);
      setCitySections([]);

      try {
        const cityParams: Record<string, any> = {
          limit: 8,
          with_count: true,
          order_by: 'count',
          order: 'desc',
        };

        const cities = await getCities(cityParams);

        if (!cities.length) {
          if (!cancelled) setCitySections([]);
          return;
        }

        const sections = await Promise.all(
          cities.map(async (cityItem: CityItem) => {
            const response: any = await getAds({ city: cityItem.city, page: 1 });
            const responseData = Array.isArray(response) ? response : response.data || [];
            return {
              city: cityItem.city,
              country: cityItem.country,
              adsCount: cityItem.ads_count,
              ads: responseData.slice(0, 5),
            };
          })
        );

        if (!cancelled) {
          setCitySections(sections.filter(section => section.ads.length > 0));
        }
      } catch {
        if (!cancelled) {
          setCitySections([]);
          setServerError(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadAdsByCity();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Nav2 />
      {/* ── Hero ── */}
      <section className='mx-auto w-full max-w-container px-gutter pb-xl pt-24 text-center sm:pt-28'>
        {/* <h1 className='mx-auto mb-lg max-w-[800px] text-display-xl text-on-surface'>
          L&apos;immobilier à votre image.
        </h1> */}
      {/* ── Promo cards ── */}
        <section className='mx-auto  pb-xl'>
          <Swiper
            modules={[Autoplay, Pagination]}
            loop={true}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{
              clickable: true,
              el: '.promo-pagination',
              bulletClass: 'inline-block h-2 w-2 rounded-full bg-outline-variant opacity-100 transition-all duration-300 cursor-pointer mx-1',
              bulletActiveClass: '!w-6 !bg-primary-container',
            }}
            spaceBetween={24}
            breakpoints={{
              0: { slidesPerView: 1, slidesPerGroup: 1 },
              768: { slidesPerView: 2, slidesPerGroup: 2 },
              1024: { slidesPerView: 3, slidesPerGroup: 3 },
            }}
            className='!pb-10'
          >
            {promoSlides.map((slide, i) => (
              <SwiperSlide key={slide.id} className='h-auto'>
                <article
                  className='relative flex h-[280px] flex-col overflow-hidden rounded-xl bg-on-secondary-fixed bg-cover bg-center p-md'
                  style={slide.image ? {
                    backgroundImage: `linear-gradient(135deg, rgba(8,15,28,0.88), rgba(8,15,28,0.65)), url(${slide.image})`,
                  } : undefined}
                >
                  {/* Badge top-right */}
                  {slide.badge && (
                    <div className='absolute right-0 top-0 rounded-bl-lg bg-primary-container px-sm py-xs text-label-md text-on-primary-container'>
                      {slide.badge}
                    </div>
                  )}

                  {/* Category chip */}
                  {slide.chip && (
                    <span className='mb-md mt-sm inline-block w-max rounded-full bg-tertiary-container px-sm py-xs text-caption text-on-tertiary-container'>
                      {slide.chip}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className='mb-sm text-headline-sm text-on-primary'>
                    {slide.title}
                  </h3>

                  {/* Description */}
                  <p className='mb-auto text-body-md text-secondary-fixed-dim'>
                    {slide.subtitle}
                  </p>

                  {/* CTA */}
                  {slide.actionUrl ? (
                    <a
                      href={slide.actionUrl}
                      className={`mt-md self-start rounded-full px-md py-sm text-label-md transition-colors ${i % 2 === 1
                        ? 'bg-primary-container text-on-primary-container hover:opacity-90'
                        : 'border border-outline/40 text-on-primary hover:bg-white/10'
                        }`}
                    >
                      {slide.cta}
                    </a>
                  ) : (
                    <button
                      type='button'
                      className={`mt-md self-start rounded-full px-md py-sm text-label-md transition-colors ${i % 2 === 1
                        ? 'bg-primary-container text-on-primary-container hover:opacity-90'
                        : 'border border-outline/40 text-on-primary hover:bg-white/10'
                        }`}
                    >
                      {slide.cta}
                    </button>
                  )}
                </article>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Dots */}
          <div className='promo-pagination mt-xs flex justify-center' />
        </section>
        <div className='relative mx-auto w-full max-w-[1000px]'>
          <div className='relative'>

            {/* ── Mobile filter card ── */}
            <div className='overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-card md:hidden'>
              <div className='flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3'>
                <div className='min-w-0 text-left'>
                  <span className='block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant'>Recherche</span>
                  <span className='block truncate text-sm font-semibold text-on-surface'>
                    {searchLocation || 'Toute localisation'} · {adTypeSummary}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => { setMobileFiltersExpanded(v => !v); setOpenFilterPopup(null); }}
                  className='flex items-center gap-1.5 rounded-xl border border-outline-variant bg-white px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low'
                >
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
                      <AddressAutocomplete
                        value={searchLocation}
                        onChange={handleSearchChange}
                        onLocationSelect={handleLocationSelect}
                        placeholder='Ville, quartier…'
                        className='h-5 w-full border-0 bg-transparent p-0 text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-0 focus:ring-0'
                      />
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={() => setOpenFilterPopup(c => c === 'budget' ? null : 'budget')}
                    className='flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'
                  >
                    <HiCurrencyDollar className='h-4 w-4 flex-shrink-0 text-on-surface-variant' />
                    <span className='min-w-0 flex-1'>
                      <span className='block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant'>Budget</span>
                      <span className='block truncate text-sm font-medium text-on-surface'>{budgetSummary}</span>
                    </span>
                    {(filters.budget_min || filters.budget_max) && (
                      <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />
                    )}
                  </button>

                  <div className='grid grid-cols-2 divide-x divide-outline-variant/60'>
                    <button
                      type='button'
                      onClick={() => setOpenFilterPopup(c => c === 'type' ? null : 'type')}
                      className='flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'
                    >
                      <HiBuildingOffice2 className='h-4 w-4 flex-shrink-0 text-on-surface-variant' />
                      <span className='min-w-0 flex-1'>
                        <span className='block truncate text-sm font-medium text-on-surface'>{adTypeSummary}</span>
                        <span className='block truncate text-[11px] text-on-surface-variant'>{filterSummary}</span>
                      </span>
                      {filters.ad_type && <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />}
                    </button>
                    <button
                      type='button'
                      onClick={() => setOpenFilterPopup(c => c === 'standing' ? null : 'standing')}
                      className='flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'
                    >
                      <HiStar className='h-4 w-4 flex-shrink-0 text-on-surface-variant' />
                      <span className='min-w-0 flex-1'>
                        <span className='block text-sm font-medium text-on-surface'>Standing</span>
                        <span className='block truncate text-[11px] text-on-surface-variant'>{standingSummary}</span>
                      </span>
                      {filters.standing && <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />}
                    </button>
                  </div>

                  <button
                    type='button'
                    onClick={() => setOpenFilterPopup(c => c === 'amenities' ? null : 'amenities')}
                    className='flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low'
                  >
                    <HiAdjustmentsHorizontal className='h-4 w-4 flex-shrink-0 text-on-surface-variant' />
                    <span className='min-w-0 flex-1'>
                      <span className='block text-sm font-medium text-on-surface'>Équipements</span>
                      <span className='block truncate text-[11px] text-on-surface-variant'>{amenitiesSummary}</span>
                    </span>
                    {filters.amenities.length > 0 && (
                      <span className='h-2 w-2 flex-shrink-0 rounded-full bg-primary' />
                    )}
                  </button>
                </div>
              )}

              <button
                type='button'
                onClick={handleSearchSubmit}
                className='w-full bg-primary px-4 py-4 text-sm font-bold text-white transition-colors hover:bg-primary-light'
              >
                Lancer la recherche
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

              <div className='flex h-[52px] min-w-0 flex-1 flex-col justify-center rounded-full px-5'>
                <span className='block text-xs font-semibold text-on-surface'>Localisation</span>
                <AddressAutocomplete
                  value={searchLocation}
                  onChange={handleSearchChange}
                  onLocationSelect={handleLocationSelect}
                  placeholder='Rechercher une localisation'
                  className='h-5 w-full border-0 bg-transparent p-0 text-sm leading-5 text-on-surface-variant outline-none placeholder:text-on-surface-variant/50 focus:border-0 focus:ring-0'
                />
              </div>

              <div className='hidden h-8 w-px bg-outline-variant md:block' />

              <div className='relative hidden min-w-0 flex-1 md:block'>
                <button
                  type='button'
                  onClick={() => setOpenFilterPopup(c => c === 'budget' ? null : 'budget')}
                  className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'
                >
                  <span className='block text-xs font-semibold text-on-surface'>Budget</span>
                  <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>
                    {budgetSummary}
                    {(filters.budget_min || filters.budget_max) && <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />}
                  </span>
                </button>
                {openFilterPopup === 'budget' && (
                  <div className={`${popupPanelClass} left-0 top-[calc(100%+8px)] w-72 max-w-[90vw]`}>
                    {renderFilterPopupContent('budget')}
                  </div>
                )}
              </div>

              <div className='hidden h-8 w-px bg-outline-variant md:block' />

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

              <div className='relative hidden min-w-0 flex-1 lg:block'>
                <button
                  type='button'
                  onClick={() => setOpenFilterPopup(c => c === 'amenities' ? null : 'amenities')}
                  className='h-[52px] w-full rounded-full px-5 py-1.5 text-left transition-colors hover:bg-surface-container-low'
                >
                  <span className='block text-xs font-semibold text-on-surface'>Equipements</span>
                  <span className='flex items-center gap-1.5 truncate text-sm text-on-surface-variant'>
                    {amenitiesSummary}
                    {filters.amenities.length > 0 && <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary' />}
                  </span>
                </button>
                {openFilterPopup === 'amenities' && (
                  <div className={`${popupPanelClass} right-0 top-[calc(100%+8px)] w-72 max-w-[90vw]`}>
                    {renderFilterPopupContent('amenities')}
                  </div>
                )}
              </div>

              <button
                type='button'
                onClick={handleSearchSubmit}
                className='relative ml-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary-light'
                title='Rechercher'
              >
                <MdSearch size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className='min-h-screen'>
  

        {/* ── City sections ── */}
        <div className='mx-auto max-w-container space-y-xl px-gutter '>
          {isLoading && <AdsSkeleton />}

          {!isLoading && serverError && <AdsErrorState />}

          {!isLoading && !serverError && citySections.length === 0 && <EmptyAdsState />}

          {!isLoading && !serverError && citySections.map(section => {
            const count = section.adsCount ?? section.ads.length;
            const cityParam = encodeURIComponent(section.city);
            return (
              <section key={`${section.city}-${section.country || 'unknown'}`}>
                {/* Header */}
                <div className='mb-md flex flex-wrap items-center gap-sm'>
                  <h2 className='text-headline-sm tracking-tight text-on-surface'>
                    {section.city}{section.country ? `, ${section.country}` : ''}
                  </h2>
                  <span className='rounded-full border border-primary-fixed bg-surface-container px-sm py-xs text-label-md text-on-primary-container'>
                    {count.toLocaleString()} annonce{count > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Cards grid */}
                <div className='grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4'>
                  {section.ads.map(ad => (
                    <ProductCard {...ad} key={ad.id} />
                  ))}
                </div>

                {/* Voir toutes */}
                {/* <div className='mt-lg flex justify-center'>
                  <button
                    type='button'
                    onClick={() => navigate(`/houses?search=${cityParam}`)}
                    className='rounded-full border border-outline bg-surface-container-lowest px-xl py-sm text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container'
                  >
                    Voir toutes les annonces
                  </button>
                </div> */}
              </section>
            );
          })}
        </div>
      </div>
      <FooterMinimal />
    </>
  );
}
