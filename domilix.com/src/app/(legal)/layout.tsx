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
      <main className='min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#ffffff_24%,#fffaf2_100%)] pt-28'>
        <div className='mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8'>
          <div className='overflow-hidden rounded-[2rem] border border-orange-100/80 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]'>
            <div className='border-b border-orange-100 bg-[radial-gradient(circle_at_top_left,#fff0d8,transparent_42%),linear-gradient(135deg,#fff8ef_0%,#ffffff_70%)] px-6 py-10 sm:px-10'>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-orange-500'>
                Informations legales
              </p>
              <p className='mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base'>
                Consultez les documents essentiels de Domilix concernant la confidentialite,
                l&apos;usage du service et la protection des donnees.
              </p>
            </div>
            <article className='prose prose-gray max-w-none px-6 py-10 prose-headings:scroll-mt-28 prose-headings:font-semibold prose-headings:text-gray-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700 prose-strong:text-gray-900 prose-li:marker:text-orange-400 sm:px-10'>
              {children}
            </article>
          </div>
        </div>
      </main>
      <FooterMinimal />
    </>
  );
}
