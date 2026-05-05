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

          <svg
            className='absolute left-[7%] top-24 h-56 w-56 text-rose-400/65'
            viewBox='0 0 220 220'
            fill='none'
          >
            <circle cx='110' cy='108' r='8' fill='currentColor' />
            <path d='M110 28v44M110 144v48M30 108h46M146 108h44M54 52l32 32M134 132l34 34M166 52l-32 32M86 132l-34 34' stroke='#fb7185' strokeWidth='10' strokeLinecap='round' />
            <path d='M110 84c13 0 24 11 24 24s-11 24-24 24-24-11-24-24 11-24 24-24Z' stroke='#f97316' strokeWidth='8' />
            <path d='M70 28 58 48 36 52l16 16-4 22 22-10 20 10-2-22 16-16-24-4-10-20Z' fill='#fda4af' />
          </svg>

          <svg
            className='absolute bottom-10 left-[5%] h-[28rem] w-[28rem] -rotate-3 text-white/80'
            viewBox='0 0 360 360'
            fill='none'
          >
            <path d='M80 278h132v-58H80v58Z' fill='currentColor' />
            <path d='M102 220v-34c0-24 19-43 43-43h32c24 0 43 19 43 43v34M106 278v34M206 278v34' stroke='#f43f5e' strokeWidth='16' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M120 246h78M218 246h24M80 246h24' stroke='#f97316' strokeWidth='18' strokeLinecap='round' />
            <path d='M246 262c32-2 54-22 56-54' stroke='#a21caf' strokeWidth='14' strokeLinecap='round' />
          </svg>

          <svg
            className='absolute bottom-24 right-[22%] h-52 w-52 text-orange-200/75'
            viewBox='0 0 220 220'
            fill='none'
          >
            <path d='M58 112h104l-20 46H78l-20-46Z' fill='currentColor' />
            <path d='M82 158v34M138 158v34M70 112l40-50 40 50' stroke='#9d174d' strokeWidth='10' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M92 112h36' stroke='#f43f5e' strokeWidth='10' strokeLinecap='round' />
          </svg>

          <svg
            className='absolute right-[12%] bottom-10 h-44 w-44 text-fuchsia-300/70'
            viewBox='0 0 220 220'
            fill='none'
          >
            <path d='M110 28v42M110 150v42M28 110h42M150 110h42M52 52l30 30M138 138l30 30M168 52l-30 30M82 138l-30 30' stroke='currentColor' strokeWidth='9' strokeLinecap='round' />
            <circle cx='110' cy='110' r='24' stroke='#f97316' strokeWidth='8' />
            <circle cx='110' cy='110' r='8' fill='#f43f5e' />
          </svg>
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
