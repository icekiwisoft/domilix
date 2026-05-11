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

          {/* ── Maison moderne — bas droite ── */}
          <svg
            className='absolute -right-16 bottom-[-4rem] h-[580px] w-[580px] text-white/60'
            viewBox='0 0 520 520'
            fill='none'
            aria-hidden='true'
          >
            {/* Corps principal */}
            <path d='M80 460V230l180-120 180 120v230H80Z' fill='currentColor' />
            {/* Toit */}
            <path d='M50 240 260 100l210 140' stroke='#fed7aa' strokeWidth='18' strokeLinecap='round' strokeLinejoin='round' />
            {/* Porte */}
            <rect x='215' y='340' width='90' height='120' rx='45' fill='#fde8cc' />
            {/* Fenêtres gauche */}
            <rect x='110' y='270' width='70' height='60' rx='10' fill='#dbeafe' opacity='.9' />
            <line x1='145' y1='270' x2='145' y2='330' stroke='#93c5fd' strokeWidth='6' />
            <line x1='110' y1='300' x2='180' y2='300' stroke='#93c5fd' strokeWidth='6' />
            {/* Fenêtres droite */}
            <rect x='340' y='270' width='70' height='60' rx='10' fill='#dbeafe' opacity='.9' />
            <line x1='375' y1='270' x2='375' y2='330' stroke='#93c5fd' strokeWidth='6' />
            <line x1='340' y1='300' x2='410' y2='300' stroke='#93c5fd' strokeWidth='6' />
            {/* Cheminée */}
            <rect x='340' y='130' width='30' height='60' rx='4' fill='#fed7aa' />
            {/* Chemin */}
            <path d='M215 460 200 520M305 460 320 520' stroke='#f97316' strokeWidth='10' strokeLinecap='round' />
            {/* Arbres */}
            <circle cx='60' cy='400' r='28' fill='#bbf7d0' opacity='.7' />
            <line x1='60' y1='428' x2='60' y2='460' stroke='#86efac' strokeWidth='8' strokeLinecap='round' />
            <circle cx='460' cy='390' r='24' fill='#bbf7d0' opacity='.7' />
            <line x1='460' y1='414' x2='460' y2='460' stroke='#86efac' strokeWidth='8' strokeLinecap='round' />
          </svg>

          {/* ── Clé — haut gauche ── */}
          <svg
            className='absolute left-[3%] top-24 h-52 w-52 -rotate-12 text-orange-100/90'
            viewBox='0 0 220 220'
            fill='none'
            aria-hidden='true'
          >
            {/* Anneau de la clé */}
            <circle cx='80' cy='90' r='48' fill='currentColor' />
            <circle cx='80' cy='90' r='28' fill='#fff7ed' />
            {/* Tige */}
            <path d='M120 90h80' stroke='#f97316' strokeWidth='16' strokeLinecap='round' />
            {/* Dents */}
            <path d='M160 90v22M180 90v16' stroke='#f97316' strokeWidth='12' strokeLinecap='round' />
            {/* Brillance */}
            <circle cx='68' cy='78' r='8' fill='white' opacity='.6' />
          </svg>

          {/* ── Localisation / pin — bas gauche ── */}
          <svg
            className='absolute bottom-16 left-[8%] h-56 w-56 rotate-6 text-orange-200/75'
            viewBox='0 0 240 240'
            fill='none'
            aria-hidden='true'
          >
            {/* Pin */}
            <path d='M120 20c-35 0-64 29-64 64 0 48 64 136 64 136s64-88 64-136c0-35-29-64-64-64Z' fill='currentColor' />
            {/* Cercle intérieur */}
            <circle cx='120' cy='84' r='26' fill='white' opacity='.85' />
            {/* Maison miniature dans le pin */}
            <path d='M108 92V80l12-8 12 8v12h-24Z' fill='#f97316' />
            <rect x='114' y='86' width='12' height='6' rx='1' fill='white' opacity='.7' />
            {/* Ombre portée */}
            <ellipse cx='120' cy='218' rx='30' ry='8' fill='#f97316' opacity='.2' />
          </svg>

          {/* ── Immeuble — haut droite ── */}
          <svg
            className='absolute right-[7%] top-20 h-60 w-60 rotate-6 text-slate-200/80'
            viewBox='0 0 240 240'
            fill='none'
            aria-hidden='true'
          >
            {/* Tour gauche */}
            <rect x='20' y='80' width='60' height='150' rx='4' fill='currentColor' />
            {/* Tour centrale (plus haute) */}
            <rect x='90' y='40' width='60' height='190' rx='4' fill='currentColor' />
            {/* Tour droite */}
            <rect x='160' y='100' width='60' height='130' rx='4' fill='currentColor' />
            {/* Fenêtres tour gauche */}
            <rect x='32' y='100' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='54' y='100' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='32' y='130' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='54' y='130' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='32' y='160' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='54' y='160' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            {/* Fenêtres tour centrale */}
            <rect x='102' y='60' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='124' y='60' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='102' y='92' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='124' y='92' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='102' y='124' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='124' y='124' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='102' y='156' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='124' y='156' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            {/* Fenêtres tour droite */}
            <rect x='172' y='118' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='194' y='118' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='172' y='148' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            <rect x='194' y='148' width='16' height='16' rx='3' fill='#bfdbfe' opacity='.9' />
            {/* Antenne tour centrale */}
            <line x1='120' y1='40' x2='120' y2='16' stroke='#fb923c' strokeWidth='6' strokeLinecap='round' />
            <circle cx='120' cy='14' r='5' fill='#fb923c' />
            {/* Sol */}
            <line x1='10' y1='230' x2='230' y2='230' stroke='#fb923c' strokeWidth='8' strokeLinecap='round' />
          </svg>

          {/* ── Canapé — bas centre-droite ── */}
          <svg
            className='absolute bottom-20 right-[26%] h-44 w-44 -rotate-3 text-orange-100/80'
            viewBox='0 0 200 160'
            fill='none'
            aria-hidden='true'
          >
            {/* Assise */}
            <rect x='20' y='80' width='160' height='50' rx='14' fill='currentColor' />
            {/* Dossier */}
            <rect x='20' y='44' width='160' height='44' rx='14' fill='#fde8cc' />
            {/* Accoudoir gauche */}
            <rect x='8' y='60' width='28' height='70' rx='12' fill='currentColor' />
            {/* Accoudoir droit */}
            <rect x='164' y='60' width='28' height='70' rx='12' fill='currentColor' />
            {/* Pieds */}
            <rect x='30' y='128' width='12' height='20' rx='4' fill='#f97316' />
            <rect x='158' y='128' width='12' height='20' rx='4' fill='#f97316' />
            {/* Coussin gauche */}
            <rect x='28' y='86' width='64' height='36' rx='10' fill='#fde8cc' opacity='.8' />
            {/* Coussin droit */}
            <rect x='108' y='86' width='64' height='36' rx='10' fill='#fde8cc' opacity='.8' />
          </svg>

          {/* ── Contrat / document — centre haut ── */}
          <svg
            className='absolute left-[42%] top-32 h-36 w-36 text-slate-300/50'
            viewBox='0 0 160 180'
            fill='none'
            aria-hidden='true'
          >
            {/* Feuille */}
            <path d='M20 20h88l32 32v108H20V20Z' fill='currentColor' />
            {/* Coin plié */}
            <path d='M108 20v32h32' fill='#e2e8f0' />
            <path d='M108 20l32 32' stroke='#94a3b8' strokeWidth='4' />
            {/* Lignes de texte */}
            <line x1='38' y1='80' x2='122' y2='80' stroke='#f97316' strokeWidth='7' strokeLinecap='round' />
            <line x1='38' y1='104' x2='122' y2='104' stroke='#cbd5e1' strokeWidth='7' strokeLinecap='round' />
            <line x1='38' y1='128' x2='90' y2='128' stroke='#cbd5e1' strokeWidth='7' strokeLinecap='round' />
            {/* Signature */}
            <path d='M38 150 q10-14 20 0 q10-14 20 0' stroke='#f97316' strokeWidth='5' strokeLinecap='round' fill='none' />
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
