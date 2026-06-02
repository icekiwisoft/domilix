import FooterMinimal from '@components/FooterMinimal/FooterMinimal';
import Nav2 from '@components/Nav2/Nav2';
import Link from 'next/link';
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
      <section className='mx-auto max-w-container px-gutter py-6 md:py-8'>
        <div className='relative overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7'>
          <div className='pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-300/30 blur-3xl' />
          <div className='relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
            <div className='max-w-2xl'>
              <p className='mb-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#E8921A]'>Nouveau · Domilix Maps</p>
              <h2 className='text-2xl font-black tracking-tight text-gray-950 md:text-3xl'>Explorez les annonces directement sur une carte.</h2>
              <p className='mt-2 text-sm leading-6 text-gray-600 md:text-base'>Repérez les biens par quartier, comparez les prix autour d’une zone et trouvez plus vite le logement qui correspond à votre recherche.</p>
            </div>
            <div className='flex flex-col gap-3 sm:flex-row md:shrink-0'>
              <Link href='/maps' className='inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#E8921A] to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:from-orange-500 hover:to-orange-600'>
                Voir sur la carte
              </Link>
              <Link href='/maps/subscription' className='inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-50'>
                Packs Maps
              </Link>
            </div>
          </div>
        </div>
      </section>
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
