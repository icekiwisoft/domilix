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
      <main className='min-h-screen bg-gradient-to-br from-[#fff8f1] via-[#f7f7f4] to-[#eef2f0] pt-28'>
        <div className='mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8'>
          <article className='prose prose-gray max-w-none rounded-3xl border border-white/60 bg-white/80 px-6 py-10 shadow-sm shadow-orange-100/40 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-gray-950 prose-h1:text-4xl prose-h2:mt-12 prose-h2:border-t prose-h2:border-white/60 prose-h2:pt-8 prose-p:leading-8 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700 prose-strong:text-gray-900 prose-li:marker:text-orange-400 sm:px-10'>
            {children}
          </article>
        </div>
      </main>
      <FooterMinimal />
    </>
  );
}
