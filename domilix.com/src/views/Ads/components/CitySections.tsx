import ProductCard from '@components/ProductCard/ProductCard';
import { Autoplay, FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import type { CitySection } from './types';
import { AdsErrorState, AdsSkeleton, EmptyAdsState } from './AdsStates';

type CitySectionsProps = {
  sections: CitySection[];
  isLoading: boolean;
  serverError: boolean;
};

export default function CitySections({ sections, isLoading, serverError }: CitySectionsProps) {
  return (
    <div className='mx-auto mb-xl max-w-container space-y-xl px-gutter'>
      {isLoading && <AdsSkeleton />}
      {!isLoading && serverError && <AdsErrorState />}
      {!isLoading && !serverError && sections.length === 0 && <EmptyAdsState />}

      {!isLoading && !serverError && sections.map(section => {
        const count = section.adsCount ?? section.ads.length;
        return (
          <section key={`${section.city}-${section.country || 'unknown'}`}>
            <div className='mb-md flex flex-wrap items-center gap-sm'>
              <div className='flex flex-wrap items-center gap-sm'>
                <h2 className='text-headline-sm tracking-tight text-on-surface'>
                  {section.city}{section.country ? `, ${section.country}` : ''}
                </h2>
                <span className='rounded-full border border-primary-fixed bg-surface-container px-sm py-xs text-label-md text-on-primary-container'>
                  {count.toLocaleString()} annonce{count > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <Swiper
              modules={[Autoplay, FreeMode]}
              autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
              freeMode
              grabCursor
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
                1280: { slidesPerView: 4, spaceBetween: 24 },
              }}
              className='!pb-sm'
            >
              {section.ads.map(ad => (
                <SwiperSlide key={ad.id} className='h-auto'>
                  <ProductCard {...ad} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        );
      })}
    </div>
  );
}
