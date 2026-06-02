import FooterMinimal from '@components/FooterMinimal/FooterMinimal';
import Nav2 from '@components/Nav2/Nav2';
import coverAnnonceurImg from '@assets/bg_img/cover_annonceur.jpg';
import furnituresPromoImg from '@assets/default-img/furnitures.jpg';
import housesPromoImg from '@assets/default-img/houses.jpg';
import homePromoImg from '@assets/img/home.jpg';
import { getAds, getBroadcasts, getCities, BroadcastItem, CityItem } from '@services/announceApi';
import { useEffect, useState } from 'react';
import 'swiper/css';

import AdsSearchHero from './components/AdsSearchHero';
import CitySections from './components/CitySections';
import PromoCarousel from './components/PromoCarousel';
import type { CitySection, PromoSlide } from './components/types';

const imageSrc = (image: string | { src: string }) =>
  typeof image === 'string' ? image : image.src;

export default function Ads(): React.ReactElement {
  const coverAnnonceurSrc = imageSrc(coverAnnonceurImg);
  const housesPromoSrc = imageSrc(housesPromoImg);
  const furnituresPromoSrc = imageSrc(furnituresPromoImg);
  const homePromoSrc = imageSrc(homePromoImg);

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

  const [citySections, setCitySections] = useState<CitySection[]>([]);
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>(defaultPromoSlides);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

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
            chip: item.chip || undefined,
            badge: item.badge || 'Promo',
            cta: item.cta || 'Voir plus',
            bg: item.bg || 'from-orange-500 to-rose-500',
            image: item.image || coverAnnonceurSrc,
            actionUrl: item.action_url || undefined,
          })),
        );
      } catch {
        // Broadcasts are optional content.
      }
    };

    loadBroadcasts();
  }, [coverAnnonceurSrc]);

  useEffect(() => {
    let cancelled = false;

    const loadAdsByCity = async () => {
      setIsLoading(true);
      setServerError(false);
      setCitySections([]);

      try {
        const cities = await getCities({
          limit: 8,
          with_count: true,
          order_by: 'count',
          order: 'desc',
        });

        const sections = await Promise.all(
          cities.map(async (cityItem: CityItem) => {
            const response: any = await getAds({ city: cityItem.city, page: 1, per_page: 13 });
            const responseData = Array.isArray(response) ? response : response.data || [];

            return {
              city: cityItem.city,
              country: cityItem.country,
              adsCount: cityItem.ads_count,
              ads: responseData,
            };
          }),
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
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Nav2 />
      <div className='mx-auto max-w-container px-gutter pt-20 sm:pt-24'>
        <PromoCarousel slides={promoSlides} />
      </div>
      <AdsSearchHero />
      <div className='min-h-screen'>
        <CitySections
          sections={citySections}
          isLoading={isLoading}
          serverError={serverError}
        />
      </div>
      <FooterMinimal />
    </>
  );
}
