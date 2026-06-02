import Nav2 from '@components/Nav2/Nav2';
import Footer2 from '@components/Footer2/Footer2';
import ProductCard from '@components/ProductCard/ProductCard';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from '@router';
import { motion } from 'framer-motion';
import { HiHeart } from 'react-icons/hi2';
import { HiLockOpen } from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { signinDialogActions } from '@stores/defineStore';

import { Ad } from '../../utils/types';
import { getFavoriteAds, getUnlockedAds } from '../../services/favoritesApi';

type Tab = 'favorites' | 'unlocked';

export default function Favorite() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('favorites');
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [bannerOffset, setBannerOffset] = useState(0);

  useEffect(() => {
    const el = document.documentElement;
    const updateOffset = () => {
      const val = getComputedStyle(el).getPropertyValue('--email-verification-banner-offset').trim();
      setBannerOffset(val ? parseInt(val, 10) : 0);
    };
    updateOffset();
    const observer = new MutationObserver(updateOffset);
    observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(e.matches);
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const navHeight = isDesktop ? 5 : 4;
  const headerTop = `calc(${navHeight}rem + ${bannerOffset}px)`;

  const loadAds = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = tab === 'favorites'
        ? await getFavoriteAds(params)
        : await getUnlockedAds(params);
      const adsData = response?.data || response || [];
      setAds(Array.isArray(adsData) ? adsData : []);
    } catch (error) {
      console.error('Error loading ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, isAuthenticated, tab]);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'favorites', label: 'Favoris', icon: <HiHeart className="h-4 w-4" /> },
    { key: 'unlocked', label: 'Annonces débloquées', icon: <HiLockOpen className="h-4 w-4" /> },
  ];

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Nav2 />
      <div className='bg-white fixed left-0 right-0 z-30 flex flex-col px-2 xl:px-10 lg:px-10 md:px-4 py-3 border-b border-gray-100' style={{ top: headerTop }}>
        <div className='font-bold text-2xl mb-3'>Mon espace logement</div>

        <div className='flex gap-1 rounded-xl bg-gray-100 p-1'>
          {tabs.map((t) => (
            <button
              key={t.key}
              type='button'
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-32 mx-2 md:mx-4 xl:mx-10 mb-6'
        >
          <div className='bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6 shadow-sm'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                <div className='w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center'>
                  <HiHeart className='w-6 h-6 text-white' />
                </div>
              </div>
              <div className='flex-1'>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Connectez-vous pour voir vos annonces
                </h3>
                <p className='text-gray-700 mb-4'>
                  Sauvegardez vos annonces préférées et retrouvez les biens débloqués en vous connectant à votre compte.
                </p>
                <button
                  onClick={signinDialogActions.toggle}
                  className='bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg'
                >
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <section
        className='grid 2xl:gap-5 py-4 2xl:px-10 xl:px-6 gap-y-4 gap-x-4 2xl:grid-cols-4 lg:grid-cols-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-2 md:px-4 flex-1 content-start'
        style={{ marginTop: navHeight * 16 + 108 + bannerOffset }}
      >
        {!isAuthenticated ? (
          <div className='col-span-full text-center py-12'>
            <div className='text-gray-400 mb-4'>
              <HiHeart className='w-16 h-16 mx-auto' />
            </div>
            <p className='text-gray-500 text-lg'>
              Connectez-vous pour voir vos annonces
            </p>
          </div>
        ) : loading ? (
          <div className='col-span-full text-center py-8'>
            <div className='text-gray-500'>Chargement...</div>
          </div>
        ) : ads.length === 0 ? (
          <div className='col-span-full text-center py-8'>
            <div className='text-gray-500 mb-4'>
              {tab === 'favorites'
                ? 'Aucune annonce favorite trouvée'
                : 'Aucune annonce débloquée'}
            </div>
            <Link
              to='/'
              className='text-orange-600 hover:underline mt-2 inline-block'
            >
              {tab === 'favorites'
                ? 'Parcourir les annonces pour ajouter des favoris'
                : 'Parcourir les annonces'}
            </Link>
          </div>
        ) : Array.isArray(ads) && ads.length > 0 ? (
          ads.map(ad => <ProductCard key={ad.id} {...ad} />)
        ) : (
          <div className='col-span-full text-center py-8'>
            <div className='text-gray-500'>Erreur lors du chargement</div>
          </div>
        )}
      </section>
      <Footer2 />
    </div>
  );
}
