import Nav2 from '@components/Nav2/Nav2';
import Footer2 from '@components/Footer2/Footer2';
import ProductCard from '@components/ProductCard/ProductCard';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Ad } from '../../utils/types';
import { getFavoriteAds } from '../../services/favoritesApi';

export default function Favorite() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const loadFavoriteAds = useCallback(async () => {
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
  }, [searchParams]);

  useEffect(() => {
    loadFavoriteAds();
  }, [loadFavoriteAds]);

  return (
    <>
      <Nav2 />
      <div className='bg-white fixed top-16 z-30 flex px-2  xl:px-10 lg:px-10 md:px-4 py-3 w-full '>
        <div className=' font-bold text-2xl '>Favoris</div>
      </div>
      <section
        className={
          ' ' +
          'grid 2xl:gap-5  mt-32 py-4  2xl:px-10 xl:px-6 gap-y-4 gap-x-4 2xl:grid-cols-4 lg:grid-cols-3 grid-cols-1  sm:grid-cols-2 md:grid-cols-3 px-2 md:px-4 '
        }
      >
        {loading ? (
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
