import ProductCard from '@components/ProductCard/ProductCard';

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
              <h2 className='text-headline-sm tracking-tight text-on-surface'>
                {section.city}{section.country ? `, ${section.country}` : ''}
              </h2>
              <span className='rounded-full border border-primary-fixed bg-surface-container px-sm py-xs text-label-md text-on-primary-container'>
                {count.toLocaleString()} annonce{count > 1 ? 's' : ''}
              </span>
            </div>

            <div className='grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4'>
              {section.ads.map(ad => (
                <ProductCard {...ad} key={ad.id} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
