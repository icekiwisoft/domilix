import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import type { PromoSlide } from './types';

type PromoCarouselProps = {
  slides: PromoSlide[];
};

export default function PromoCarousel({ slides }: PromoCarouselProps) {
  return (
    <section className='mx-auto pb-3'>
      <Swiper
        modules={[Autoplay, Pagination]}
        loop
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
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className='h-auto'>
            <article
              className='relative flex h-[280px] flex-col overflow-hidden rounded-xl bg-on-secondary-fixed bg-cover bg-center p-md'
              style={slide.image ? {
                backgroundImage: `linear-gradient(135deg, rgba(8,15,28,0.88), rgba(8,15,28,0.65)), url(${slide.image})`,
              } : undefined}
            >
              {slide.badge && (
                <div className='absolute right-0 top-0 rounded-bl-lg bg-primary-container px-sm py-xs text-label-md text-on-primary-container'>
                  {slide.badge}
                </div>
              )}

              {slide.chip && (
                <span className='mb-md mt-sm inline-block w-max rounded-full bg-tertiary-container px-sm py-xs text-caption text-on-tertiary-container'>
                  {slide.chip}
                </span>
              )}

              <h3 className='mb-sm text-headline-sm text-on-primary'>{slide.title}</h3>
              <p className='mb-auto text-body-md text-secondary-fixed-dim'>{slide.subtitle}</p>

              {slide.actionUrl ? (
                <a
                  href={slide.actionUrl}
                  className={`mt-md self-start rounded-full px-md py-sm text-label-md transition-colors ${index % 2 === 1
                    ? 'bg-primary-container text-on-primary-container hover:opacity-90'
                    : 'border border-outline/40 text-on-primary hover:bg-white/10'
                    }`}
                >
                  {slide.cta}
                </a>
              ) : (
                <button
                  type='button'
                  className={`mt-md self-start rounded-full px-md py-sm text-label-md transition-colors ${index % 2 === 1
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

      <div className='promo-pagination mt-xs flex justify-center' />
    </section>
  );
}
