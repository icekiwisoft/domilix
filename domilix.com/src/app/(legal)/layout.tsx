import FooterMinimal from '@components/FooterMinimal/FooterMinimal';
import Nav2 from '@components/Nav2/Nav2';
import React from 'react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav2 />
      <main className='relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fff8f1] via-[#f7f7f4] to-[#eef2f0] pt-28'>
        <div className='pointer-events-none fixed inset-0 z-0 overflow-hidden'>
          <div className='absolute -left-28 top-24 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl' />
          <div className='absolute right-[-8rem] top-44 h-96 w-96 rounded-full bg-slate-300/35 blur-3xl' />
          <svg
            className='absolute -right-24 bottom-[-8rem] h-[620px] w-[620px] text-white/70'
            viewBox='0 0 520 520'
            fill='none'
            aria-hidden='true'
          >
            <path d='M74 424V176l93-54 93 54 93-54 93 54v248H74Z' fill='currentColor' />
            <path d='M167 122V68h186v54M126 424V226h82v198M312 424V226h82v198' stroke='#fed7aa' strokeWidth='20' strokeLinejoin='round' />
            <path d='M47 186 167 116l93 54 93-54 120 70' stroke='#fb923c' strokeWidth='18' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M238 244h44M238 296h44M238 348h44' stroke='#0d3556' strokeWidth='16' strokeLinecap='round' />
          </svg>
          <svg
            className='absolute left-[3%] top-28 h-52 w-52 -rotate-12 text-orange-100/90'
            viewBox='0 0 220 220'
            fill='none'
            aria-hidden='true'
          >
            <path d='M55 44h92c20 0 36 16 36 36v82H19V80c0-20 16-36 36-36Z' fill='currentColor' />
            <path d='M48 162v26M154 162v26M37 106h156' stroke='#fb923c' strokeWidth='14' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M56 92c12-20 36-20 48 0 12-20 36-20 48 0' stroke='#fff7ed' strokeWidth='16' strokeLinecap='round' />
            <path d='M55 44c15 0 24-12 41-12s26 12 41 12' stroke='#f97316' strokeWidth='10' strokeLinecap='round' />
          </svg>
          <svg
            className='absolute bottom-20 left-[9%] h-60 w-60 rotate-6 text-orange-200/75'
            viewBox='0 0 260 260'
            fill='none'
            aria-hidden='true'
          >
            <path d='M130 24c-43 0-78 35-78 78 0 61 78 134 78 134s78-73 78-134c0-43-35-78-78-78Z' fill='currentColor' />
            <path d='M82 104h96M98 104V76h64v28M104 104v72M156 104v72M88 176h84' stroke='#f97316' strokeWidth='14' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M110 130h40' stroke='#fff7ed' strokeWidth='14' strokeLinecap='round' />
            <circle cx='130' cy='92' r='52' stroke='#fff7ed' strokeWidth='12' />
          </svg>
          <svg
            className='absolute right-[8%] top-24 h-56 w-56 rotate-12 text-slate-200/80'
            viewBox='0 0 240 240'
            fill='none'
            aria-hidden='true'
          >
            <path d='M46 182V64h42v118H46Zm58 0V38h42v144h-42Zm58 0V82h42v100h-42Z' fill='currentColor' />
            <path d='M62 88h10M62 120h10M62 152h10M120 64h10M120 96h10M120 128h10M120 160h10M178 108h10M178 140h10' stroke='#0d3556' strokeWidth='10' strokeLinecap='round' />
            <path d='M30 182h186M104 38l21-24 21 24M162 82l21-24 21 24' stroke='#fb923c' strokeWidth='12' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          <svg
            className='absolute bottom-24 right-[28%] h-48 w-48 -rotate-6 text-orange-100/80'
            viewBox='0 0 220 220'
            fill='none'
            aria-hidden='true'
          >
            <path d='M38 164h144v-60H38v60Z' fill='currentColor' />
            <path d='M56 104V72c0-18 14-32 32-32h44c18 0 32 14 32 32v32M62 164v26M158 164v26' stroke='#f97316' strokeWidth='14' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M68 128h84M164 128h18M38 128h18' stroke='#fff7ed' strokeWidth='18' strokeLinecap='round' />
            <path d='M82 70c10-12 20-12 30 0 10-12 20-12 30 0' stroke='#fb923c' strokeWidth='10' strokeLinecap='round' />
          </svg>
          <svg
            className='absolute left-[42%] top-36 h-40 w-40 text-slate-300/50'
            viewBox='0 0 200 200'
            fill='none'
            aria-hidden='true'
          >
            <path d='M54 78c0-25 20-45 45-45s45 20 45 45-20 45-45 45H54V78Z' fill='currentColor' />
            <path d='M98 124v45M72 169h52M88 76c8-14 22-14 30 0M78 96h42' stroke='#fb923c' strokeWidth='12' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M54 124 30 148M144 78l26-26' stroke='#fff7ed' strokeWidth='14' strokeLinecap='round' />
          </svg>
        </div>

        <div className='relative z-10 mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8'>
          <article className='prose prose-gray max-w-none rounded-3xl border border-white/60 bg-white/65 px-6 py-10 shadow-sm shadow-orange-100/40 backdrop-blur-[2px] prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-gray-950 prose-h1:text-4xl prose-h2:mt-12 prose-h2:border-t prose-h2:border-white/60 prose-h2:pt-8 prose-p:leading-8 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700 prose-strong:text-gray-900 prose-li:marker:text-orange-400 sm:px-10'>
            {children}
          </article>
        </div>
      </main>
      <div className='relative z-20'>
        <FooterMinimal />
      </div>
    </>
  );
}
