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
import React, { useCallback, useEffect, useState } from 'react';
import { MdChevronLeft, MdChevronRight, MdSearch } from 'react-icons/md';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useSearchParams, useNavigate } from '@router';
import 'swiper/css';
import 'swiper/css/pagination';

type PromoSlide = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
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
            <div className='h-6 w-40 animate-pulse rounded-full bg-gray-300' />
            <div className='h-7 w-24 animate-pulse rounded-full bg-gray-300' />
          </div>

          <div className='grid w-full grid-cols-1 gap-x-2 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-4 xl:grid-cols-4 2xl:grid-cols-5'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='overflow-hidden rounded-3xl bg-gray-200 shadow-sm'>
                <div className='aspect-[4/3] animate-pulse bg-gray-400' />
                <div className='space-y-3 p-4'>
                  <div className='h-4 w-3/4 animate-pulse rounded-full bg-gray-400' />
                  <div className='h-4 w-1/2 animate-pulse rounded-full bg-gray-300' />
                  <div className='flex items-center justify-between pt-2'>
                    <div className='h-5 w-24 animate-pulse rounded-full bg-gray-400' />
                    <div className='h-9 w-9 animate-pulse rounded-full bg-gray-300' />
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
        <div className='mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-orange-50 text-orange-500'>
          <svg viewBox='0 0 120 120' className='h-20 w-20' fill='none' aria-hidden='true'>
            <path d='M24 51 60 25l36 26v40a5 5 0 0 1-5 5H29a5 5 0 0 1-5-5V51Z' fill='#FFF4E5' stroke='currentColor' strokeWidth='5' strokeLinejoin='round' />
            <path d='M48 96V67h24v29M38 52h44' stroke='currentColor' strokeWidth='5' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M91 30 102 19M100 41h14M20 24l9 9' stroke='#FDBA74' strokeWidth='5' strokeLinecap='round' />
            <circle cx='24' cy='86' r='5' fill='currentColor' />
            <circle cx='96' cy='86' r='4' fill='#FDBA74' />
          </svg>
        </div>
        <p className='text-xs font-black uppercase tracking-[0.24em] text-orange-500'>
          Aucun résultat
        </p>
        <h2 className='mt-3 text-3xl font-black tracking-tight text-slate-950'>
          Aucune annonce mise en avant pour le moment
        </h2>
        <p className='mt-3 text-sm leading-6 text-slate-500'>
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
          Impossible de charger les annonces
        </h2>
        <p className='mt-3 text-sm leading-6 text-slate-500'>
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
    typeof furnituresPromoImg === 'string'
      ? furnituresPromoImg
      : furnituresPromoImg.src;
  const coverAnnonceurSrc =
    typeof coverAnnonceurImg === 'string'
      ? coverAnnonceurImg
      : coverAnnonceurImg.src;
  const homePromoSrc =
    typeof homePromoImg === 'string' ? homePromoImg : homePromoImg.src;

  const defaultPromoSlides: PromoSlide[] = [
    {
      id: 'promo-publier-gratuit',
      title: 'Publiez Votre Bien Gratuitement',
      subtitle: 'Premiere annonce sans frais pour attirer vos premiers clients',
      badge: '100% OFF',
      cta: 'Publier maintenant',
      bg: 'from-orange-500 to-rose-500',
      image: coverAnnonceurSrc,
    },
    {
      id: 'promo-boost-annonce',
      title: 'Boostez Votre Annonce',
      subtitle: 'Mettez votre annonce en tete des recherches pendant 7 jours',
      badge: '50% OFF',
      cta: 'Activer le boost',
      bg: 'from-pink-500 to-red-500',
      image: housesPromoSrc,
    },
    {
      id: 'promo-pack-pro',
      title: 'Pack Pro Agence',
      subtitle: 'Publiez en illimite et obtenez plus de visibilite chaque semaine',
      badge: '35% OFF',
      cta: 'Voir le pack pro',
      bg: 'from-amber-500 to-orange-600',
      image: furnituresPromoSrc,
    },
    {
      id: 'promo-photo-pro',
      title: 'Photos Pro + Verification',
      subtitle: 'Donnez plus de confiance a vos annonces et vendez plus vite',
      badge: '20% OFF',
      cta: 'Decouvrir le service',
      bg: 'from-blue-500 to-indigo-500',
      image: homePromoSrc,
    },
  ];

  const [citySections, setCitySections] = useState<
    Array<{ city: string; country?: string; adsCount?: number; ads: Ad[] }>
  >([]);
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>(defaultPromoSlides);
  const [promoSwiper, setPromoSwiper] = useState<any>(null);
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
  const [UrlSearchParam] = useSearchParams();
  const navigate = useNavigate();

  // Compter les filtres actifs
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
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked ? 'border-orange-500' : 'border-gray-300'
                          }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${checked ? 'bg-orange-500' : 'bg-transparent'
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
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked ? 'border-orange-500' : 'border-gray-300'
                          }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${checked ? 'bg-orange-500' : 'bg-transparent'
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
                { key: 'wifi', name: 'WiFi inclus' },
                { key: 'air_conditioning', name: 'Climatisation' },
                { key: 'security_24h', name: 'Sécurité 24h/24' },
                { key: 'equipped_kitchen', name: 'Cuisine équipée' },
                { key: 'smart_tv', name: 'Smart TV' },
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
      } catch (error) {
        console.error('Erreur lors du chargement des broadcasts:', error);
      }
    };

    loadBroadcasts();
  }, [coverAnnonceurSrc]);

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

  const buildSearchParams = () => {
    const newSearchParams = new URLSearchParams();

    if (searchLocation.trim()) {
      newSearchParams.set('search', searchLocation.trim());
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          value.forEach(v => newSearchParams.append(key, v));
        }
      } else if (value && value.toString().trim()) {
        newSearchParams.set(key, value.toString());
      }
    });

    return newSearchParams;
  };

  const handleSearchSubmit = () => {
    const params = buildSearchParams();
    navigate(`/search?${params.toString()}`);
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

  const buildParamsFromUrl = useCallback(() => {
    const params: Record<string, any> = {};

    UrlSearchParam.forEach((value, key) => {
      if (key === 'category_id' || key === 'amenities') {
        if (!params[key]) params[key] = [];
        params[key].push(value);
      } else {
        params[key] = value;
      }
    });

    return params;
  }, [UrlSearchParam]);

  useEffect(() => {
    let cancelled = false;

    const loadAdsByCity = async () => {
      setIsLoading(true);
      setServerError(false);
      setCitySections([]);

      try {
        const baseParams = buildParamsFromUrl();
        const cityParams: Record<string, any> = {
          ...baseParams,
          limit: 8,
          with_count: true,
          order_by: 'count',
          order: 'desc',
        };

        const cities = await getCities(cityParams);

        if (!cities.length) {
          if (!cancelled) {
            setCitySections([]);
          }
          return;
        }

        const sections = await Promise.all(
          cities.map(async (cityItem: CityItem) => {
            const response: any = await getAds({
              ...baseParams,
              city: cityItem.city,
              page: 1,
            });

            const responseData = Array.isArray(response)
              ? response
              : response.data || [];

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
      } catch (error) {
        console.error('Erreur lors du chargement des villes:', error);
        if (!cancelled) {
          setCitySections([]);
          setServerError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAdsByCity();

    return () => {
      cancelled = true;
    };
  }, [buildParamsFromUrl]);

  return (
    <>
      <Nav2 />
      <div data-tour='houses-filters' className='sticky top-[calc(4rem+var(--email-verification-banner-offset,0px))] z-20 w-screen px-4 py-3 backdrop-blur-sm sm:px-6 md:fixed md:top-[calc(4rem+var(--email-verification-banner-offset,0px))] lg:px-8'>
        <div className='mx-auto w-full max-w-6xl'>
          <div className='relative'>
            <div className='overflow-hidden rounded-2xl border-2 border-orange-500 bg-white shadow-xl shadow-orange-900/10 md:hidden'>
              <div className='flex items-center justify-between gap-3 border-b border-orange-100 px-5 py-3'>
                <div className='min-w-0 text-left'>
                  <span className='block text-xs font-black uppercase tracking-wide text-orange-500'>Filtres</span>
                  <span className='block truncate text-sm font-bold text-slate-700'>
                    {searchLocation || 'Localisation'} • {adTypeSummary}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    setMobileFiltersExpanded(value => !value);
                    setOpenFilterPopup(null);
                  }}
                  className='rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-600 transition hover:bg-orange-100'
                >
                  {mobileFiltersExpanded ? 'Réduire' : 'Modifier'}
                </button>
              </div>

              {mobileFiltersExpanded && <div className='divide-y divide-gray-100'>
                <div className='flex items-center gap-3 px-5 py-4'>
                  <span className='h-4 w-4 rounded-full border-4 border-slate-500' />
                  <div className='min-w-0 flex-1 text-left'>
                    <span className='block text-sm font-bold text-slate-600'>Localisation</span>
                    <AddressAutocomplete
                      value={searchLocation}
                      onChange={handleSearchChange}
                      onLocationSelect={handleLocationSelect}
                      placeholder='Rechercher une localisation'
                      className='h-5 w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-0 focus:ring-0'
                    />
                  </div>
                </div>

                <button
                  type='button'
                  onClick={() => setOpenFilterPopup(current => current === 'budget' ? null : 'budget')}
                  className='flex w-full items-center gap-3 px-5 py-4 text-left'
                >
                  <span className='h-4 w-4 rounded-full border-4 border-slate-500' />
                  <span className='min-w-0 flex-1'>
                    <span className='block text-sm font-bold text-slate-600'>Budget</span>
                    <span className='block truncate text-sm font-semibold text-slate-800'>{budgetSummary}</span>
                  </span>
                </button>

                <div className='grid grid-cols-2 divide-x divide-gray-100'>
                  <button
                    type='button'
                    onClick={() => setOpenFilterPopup(current => current === 'type' ? null : 'type')}
                    className='flex items-center gap-2 px-5 py-4 text-left'
                  >
                    <span className='text-slate-500'>▣</span>
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm font-bold text-slate-700'>{adTypeSummary}</span>
                      <span className='block truncate text-xs font-semibold text-slate-400'>{filterSummary}</span>
                    </span>
                  </button>
                  <button
                    type='button'
                    onClick={() => setOpenFilterPopup(current => current === 'standing' ? null : 'standing')}
                    className='flex items-center gap-2 px-5 py-4 text-left'
                  >
                    <span className='text-slate-500'>▣</span>
                    <span className='min-w-0 flex-1'>
                      <span className='block text-sm font-bold text-slate-700'>Standing</span>
                      <span className='block truncate text-xs font-semibold text-slate-400'>{standingSummary}</span>
                    </span>
                  </button>
                </div>

                <button
                  type='button'
                  onClick={() => setOpenFilterPopup(current => current === 'amenities' ? null : 'amenities')}
                  className='flex w-full items-center gap-3 px-5 py-4 text-left'
                >
                  <span className='text-slate-500'>♢</span>
                  <span className='min-w-0 flex-1'>
                    <span className='block text-sm font-bold text-slate-700'>Équipements</span>
                    <span className='block truncate text-sm font-semibold text-slate-500'>{amenitiesSummary}</span>
                  </span>
                </button>
              </div>}

              <button
                type='button'
                onClick={handleSearchSubmit}
                className='w-full border-t border-orange-200 bg-orange-500 px-5 py-4 text-sm font-black text-white transition-colors hover:bg-orange-600'
              >
                {mobileFiltersExpanded ? 'Rechercher' : 'Rechercher avec ces filtres'}
              </button>
            </div>

            {openFilterPopup && (
              <div className='absolute left-0 right-0 top-[calc(100%+8px)] z-40 mx-auto w-[92vw] max-w-sm rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.55)] ring-1 ring-black/5 md:hidden'>
                {renderFilterPopupContent(openFilterPopup)}
              </div>
            )}

            <div className='-translate-y-1 hidden items-center rounded-full border border-gray-200 bg-white px-3 py-1 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.35)] transition-shadow md:flex'>
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
                onClick={handleSearchSubmit}
                className='relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm transition-colors hover:bg-orange-600'
                title='Rechercher'
              >
                <MdSearch size={18} />
              </button>

            </div>
          </div>
        </div>
      </div>

      <div className=' min-h-screen'>
        <section className='mt-8 px-5 md:mt-44 sm:px-8 lg:px-12'>
          <div data-tour='promo-swiper' className='relative w-full max-w-full overflow-hidden'>
            <Swiper
              modules={[Autoplay, Pagination]}
              onSwiper={setPromoSwiper}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              pagination={{
                clickable: true,
                el: '.ads-promos-pagination',
                bulletClass:
                  'swiper-pagination-bullet !mx-1 !h-2 !w-2 !rounded-full !bg-orange-200 !opacity-100 transition-all',
                bulletActiveClass:
                  'swiper-pagination-bullet-active !w-8 !rounded-full !bg-orange-500',
              }}
              className='!w-full !max-w-full [&_.swiper-wrapper]:items-stretch'
              spaceBetween={18}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1200: { slidesPerView: 3 },
              }}
            >
              {promoSlides.map(slide => (
                <SwiperSlide key={slide.id} className='!h-auto'>
                  <article
                    className={`group relative flex h-[250px] w-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br ${slide.bg} bg-cover bg-center p-5 text-white shadow-sm transition duration-300 hover:shadow-lg sm:h-[285px] sm:p-6`}
                    style={
                      slide.image
                        ? {
                          backgroundImage: `linear-gradient(135deg, rgba(8,15,28,0.86), rgba(8,15,28,0.58)), url(${slide.image})`,
                        }
                        : undefined
                    }
                  >
                    <span className='absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow-sm'>
                      {slide.badge}
                    </span>

                    <p className='relative text-xs font-black uppercase tracking-[0.2em] text-orange-200'>
                      Promo annonceur
                    </p>
                    <h3 className='relative mt-4 max-w-[14rem] text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl'>
                      {slide.title}
                    </h3>
                    <p className='relative mt-3 max-w-[18rem] text-sm font-medium leading-6 text-white/85'>
                      {slide.subtitle}
                    </p>
                    {slide.actionUrl ? (
                      <a
                        href={slide.actionUrl}
                        className='relative mt-auto inline-flex w-fit items-center rounded-full bg-orange-500 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-orange-600'
                      >
                        {slide.cta}
                      </a>
                    ) : (
                      <button
                        type='button'
                        className='relative mt-auto w-fit rounded-full bg-orange-500 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-orange-600'
                      >
                        {slide.cta}
                      </button>
                    )}
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              type='button'
              onClick={() => promoSwiper?.slidePrev()}
              className='absolute left-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-orange-600 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-orange-50 md:inline-flex'
              aria-label='Slide precedent'
            >
              <MdChevronLeft size={18} />
            </button>

            <button
              type='button'
              onClick={() => promoSwiper?.slideNext()}
              className='absolute right-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-orange-600 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-orange-50 md:inline-flex'
              aria-label='Slide suivant'
            >
              <MdChevronRight size={18} />
            </button>

            <div className='mt-4 flex items-center justify-center'>
              <div className='ads-promos-pagination flex min-h-[10px] items-center justify-center' />
            </div>
          </div>
        </section>

        <div className='mt-6 space-y-10 px-5 py-6 sm:px-8 lg:px-12'>
          {isLoading && <AdsSkeleton />}

          {!isLoading && serverError && <AdsErrorState />}

          {!isLoading && !serverError && citySections.length === 0 && (
            <EmptyAdsState />
          )}

          {!isLoading && !serverError && citySections.map(section => (
            <section
              key={`${section.city}-${section.country || 'unknown'}`}
              className='space-y-4'
            >
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h3 className='text-lg font-semibold text-gray-900 sm:text-xl'>
                  {section.city}
                  {section.country ? `, ${section.country}` : ''}
                </h3>
                <span className='inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700'>
                  {section.adsCount ?? section.ads.length} annonce
                  {(section.adsCount ?? section.ads.length) > 1 ? 's' : ''}
                </span>
              </div>

              <div data-tour='ads-grid' className='grid w-full grid-cols-1 gap-x-2 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-4 xl:grid-cols-4 2xl:grid-cols-5'>
                {section.ads.map(ad => (
                  <ProductCard {...ad} key={ad.id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <FooterMinimal />
    </>
  );
}
