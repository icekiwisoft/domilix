export function AdsSkeleton() {
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

export function EmptyAdsState() {
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

export function AdsErrorState() {
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
