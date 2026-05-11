import Nav2 from '@components/Nav2/Nav2';
import Timer from '@components/Timer/Timer';
import React from 'react';

export default function Terrains(): React.ReactElement {
  const targetDate = new Date('2026-12-01T23:59:59');

  return (
    <>
      <Nav2 />

      <section className='relative flex min-h-screen items-center justify-center overflow-hidden pt-20'>

        {/* ── Background image ── */}
        <div className='absolute inset-0'>
          <img
            src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600'
            alt='Terrain au Cameroun'
            className='h-full w-full object-cover object-center'
          />
          {/* Dark overlay with green-earth tint */}
          <div className='absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-[#0a1a00]/80' />
        </div>

        {/* ── Decorative blobs ── */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden='true'>
          <div className='absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-green-600/15 blur-3xl' />
          <div className='absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-[#E8921A]/15 blur-3xl' />
        </div>

        {/* ── Content ── */}
        <div className='relative z-10 mx-auto max-w-3xl px-6 py-20 text-center'>

          {/* Heading */}
          <h1 className='text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl'>
            Les terrains arrivent
            <br />
            <span className='text-[#E8921A]'>très bientôt.</span>
          </h1>

          {/* Subtext */}
          <p className='mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-white/65 sm:text-xl'>
            Trouvez et publiez des terrains à vendre ou à louer partout au Cameroun —
            constructibles, agricoles ou commerciaux.
          </p>

          {/* Timer */}
          <div className='mt-14'>
            <p className='mb-6 text-xs font-black uppercase tracking-[0.3em] text-white/40'>
              Lancement dans
            </p>
            <TimerDark targetDate={targetDate} />
          </div>

        </div>
      </section>
    </>
  );
}

/* ── Custom dark-styled timer ─────────────────────────────────── */
function TimerDark({ targetDate }: { targetDate: Date }) {
  return (
    <div className='[&_.timer_p]:text-white/40 [&_.timer_p]:font-black [&_.timer_p]:uppercase [&_.timer_p]:tracking-widest [&_.timer_p]:text-[10px] [&_.timer_p]:mt-2 [&_h3]:text-white/25 [&_h3]:text-2xl [&_span]:!bg-white/10 [&_span]:!border-white/10 [&_span]:!text-white [&_span]:!font-black [&_span]:!text-2xl [&_span]:sm:!text-3xl [&_span]:!h-14 [&_span]:!w-12 [&_span]:sm:!h-16 [&_span]:sm:!w-14 [&_span]:!rounded-2xl'>
      <Timer targetDate={targetDate} dayDigits={3} />
    </div>
  );
}
