import Nav2 from '@components/Nav2/Nav2';
import Timer from '@components/Timer/Timer';
import React from 'react';

export default function Furnitures(): React.ReactElement {
  const targetDate = new Date('2026-09-01T23:59:59');
  return (
    <>
      <Nav2 />
      <section className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-fuchsia-50 to-orange-50 px-4'>
        <div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden='true'>
          <div className='absolute -right-24 top-28 h-80 w-80 rounded-full bg-rose-300/40 blur-3xl' />
          <div className='absolute -left-20 bottom-14 h-80 w-80 rounded-full bg-fuchsia-300/35 blur-3xl' />
          <div className='absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-200/35 blur-3xl' />
        </div>

        <div className='relative z-10 max-w-4xl mx-auto text-center space-y-8 bg-white/85 backdrop-blur-sm p-12 rounded-2xl shadow-xl shadow-rose-200/50'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight'>
            Bientôt disponible !
          </h1>

          <p className='text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed'>
            Nous travaillons d'arrache-pied pour vous proposer un nouveau
            service super cool. Reste connecté(e) pour en savoir plus.
          </p>

          <div className='mt-12'>
            <Timer targetDate={targetDate} dayDigits={3} />
          </div>
        </div>
      </section>
    </>
  );
}
