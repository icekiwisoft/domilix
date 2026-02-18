import Nav2 from '@components/Nav2/Nav2';
import Footer2 from '@components/Footer2/Footer2';
import ProductCard from '@components/ProductCard/ProductCard';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHeart } from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { signinDialogActions } from '@stores/defineStore';

import { Ad } from '../../utils/types';
import { getFavoriteAds } from '../../services/favoritesApi';

export default function Favorite() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const loadFavoriteAds = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = await getFavoriteAds(params);
      // Handle the case where response has a data property
      const adsData = response?.data || response || [];
      setAds(Array.isArray(adsData) ? adsData : []);
    } catch (error) {
      console.error('Error loading favorite ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, isAuthenticated]);

  useEffect(() => {
    loadFavoriteAds();
  }, [loadFavoriteAds]);

  return (
    <>
      <Nav2 />
      <div className='bg-white fixed top-16 z-30 flex px-2  xl:px-10 lg:px-10 md:px-4 py-3 w-full '>
        <div className=' font-bold text-2xl '>Favoris</div>
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
                  Connectez-vous pour voir vos favoris
                </h3>
                <p className='text-gray-700 mb-4'>
                  Sauvegardez vos annonces préférées et retrouvez-les
                  facilement en vous connectant à votre compte.
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
        className={
          ' ' +
          'grid 2xl:gap-5  mt-32 py-4  2xl:px-10 xl:px-6 gap-y-4 gap-x-4 2xl:grid-cols-4 lg:grid-cols-3 grid-cols-1  sm:grid-cols-2 md:grid-cols-3 px-2 md:px-4 '
        }
      >
        {!isAuthenticated ? (
          <div className='col-span-full text-center py-12'>
            <div className='text-gray-400 mb-4'>
              <HiHeart className='w-16 h-16 mx-auto' />
            </div>
            <p className='text-gray-500 text-lg'>
              Connectez-vous pour voir vos favoris
            </p>
          </div>
        ) : loading ? (
          <div className='col-span-full text-center py-8'>
            <div className='text-gray-500'>Chargement des favoris...</div>
          </div>
        ) : ads.length === 0 ? (
          <div className='col-span-full text-center py-8'>
            <div className='text-gray-500 mb-4'>
              Aucune annonce favorite trouvée
            </div>
            <Link
              to='/'
              className='text-orange-600 hover:underline mt-2 inline-block'
            >
              Parcourir les annonces pour ajouter des favoris
            </Link>
          </div>
        ) : Array.isArray(ads) && ads.length > 0 ? (
          ads.map(ad => <ProductCard key={ad.id} {...ad} />)
        ) : (
          <div className='col-span-full text-center py-8'>
            <div className='text-gray-500'>
              Erreur lors du chargement des favoris
            </div>
          </div>
        )}
      </section>
      <Footer2 />
    </>
  );
}
