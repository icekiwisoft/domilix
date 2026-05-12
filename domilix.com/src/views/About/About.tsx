'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Nav2 from '@components/Nav2/Nav2';
import Footer2 from '@components/Footer2/Footer2';
import { Link } from '@router';
import { newsletterApi } from '@services/newsletterApi';
import HoneypotInput from '@components/HoneypotInput/HoneypotInput';

/* ─── Animation variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay } }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (delay = 0) => ({ opacity: 1, transition: { duration: 0.6, delay } }),
};

/* ─── Data ───────────────────────────────────────────────────── */
const VALUES = [
  {
    icon: (
      <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
      </svg>
    ),
    title: 'Confiance',
    desc: 'Chaque annonce est vérifiée pour vous offrir une expérience sécurisée et transparente.',
  },
  {
    icon: (
      <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M13 10V3L4 14h7v7l9-11h-7z' />
      </svg>
    ),
    title: 'Simplicité',
    desc: 'Une interface intuitive pour trouver votre bien en quelques clics, sans friction.',
  },
  {
    icon: (
      <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' />
      </svg>
    ),
    title: 'Communauté',
    desc: 'Propriétaires, annonceurs et locataires réunis sur une seule plateforme locale.',
  },
  {
    icon: (
      <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
      </svg>
    ),
    title: 'Innovation',
    desc: 'Des outils modernes pour simplifier chaque étape de votre recherche immobilière.',
  },
];



/* ─── Component ──────────────────────────────────────────────── */
export default function About(): React.ReactElement {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterWebsite, setNewsletterWebsite] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNewsletterMessage('');
    setNewsletterError('');

    const email = newsletterEmail.trim();
    if (!email || !email.includes('@')) {
      setNewsletterError('Veuillez saisir une adresse email valide.');
      return;
    }

    try {
      setNewsletterLoading(true);
      const response = await newsletterApi.subscribe(email, newsletterWebsite);
      setNewsletterMessage(response.message || 'Inscription à la newsletter réussie.');
      setNewsletterEmail('');
      setNewsletterWebsite('');
    } catch (error: any) {
      setNewsletterError(
        error.response?.data?.message ||
          error.response?.data?.email?.[0] ||
          "Impossible de vous inscrire à la newsletter.",
      );
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <>
      <Nav2 />

      <main className='min-h-screen bg-[#fff8f4]'>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className='relative overflow-hidden'>
          {/* Mosaic grid */}
          <div className='grid h-[38rem] grid-cols-2 gap-1 md:h-[52rem] md:grid-cols-4'>
            {[
              { src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600', alt: 'Maison moderne' },
              { src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', alt: 'Salon élégant' },
              { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600', alt: 'Appartement lumineux' },
              { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', alt: 'Mobilier design' },
            ].map((img, i) => (
              <motion.div
                key={img.src}
                className='relative overflow-hidden'
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={img.src} alt={img.alt} className='h-full w-full object-cover' />
              </motion.div>
            ))}
          </div>

          {/* Gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-b from-black/50 via-black/45 to-black/75' />

          {/* Hero text */}
          <div className='absolute inset-0 flex flex-col items-center justify-center px-4 text-center'>
            <motion.span
              variants={fadeUp}
              initial='hidden'
              animate='show'
              custom={0.15}
              className='mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs font-black uppercase tracking-[0.3em] text-white/80 backdrop-blur-sm'
            >
              Qui sommes-nous
            </motion.span>

            <motion.h1
              variants={fadeUp}
              initial='hidden'
              animate='show'
              custom={0.25}
              className='max-w-5xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl'
            >
              L'immobilier camerounais,{' '}
              <span className='text-[#E8921A]'>réinventé.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial='hidden'
              animate='show'
              custom={0.35}
              className='mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/80 sm:text-xl'
            >
              Domilix connecte propriétaires, annonceurs et chercheurs de biens
              sur une plateforme sécurisée, simple et locale.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial='hidden'
              animate='show'
              custom={0.45}
              className='mt-8 flex flex-wrap justify-center gap-3'
            >
              <Link
                to='/houses'
                className='rounded-full bg-[#E8921A] px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-600'
              >
                Explorer les annonces
              </Link>
              <Link
                to='/settings?tab=announcer'
                className='rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white hover:text-gray-900'
              >
                Devenir annonceur
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className='absolute bottom-6 left-1/2 -translate-x-1/2'
          >
            <div className='flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 p-1.5'>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                className='h-2 w-1 rounded-full bg-white/70'
              />
            </div>
          </motion.div>
        </section>



        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>

          {/* ── MISSION ──────────────────────────────────────────── */}
          <motion.section
            variants={fadeUp}
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
            className='py-24 text-center'
          >
            <span className='mb-4 inline-block text-xs font-black uppercase tracking-[0.3em] text-[#E8921A]'>
              Notre mission
            </span>
            <h2 className='mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl'>
              Rendre l'accès au logement simple, clair et rassurant
            </h2>
            <p className='mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600 sm:text-xl'>
              Nous révolutionnons le marché immobilier et du mobilier au Cameroun en créant
              une plateforme transparente qui connecte propriétaires, annonceurs et chercheurs
              de biens — du premier clic jusqu'au contact.
            </p>
          </motion.section>

          {/* ── VALUES ───────────────────────────────────────────── */}
          <section className='pb-24'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  variants={fadeUp}
                  initial='hidden'
                  whileInView='show'
                  viewport={{ once: true }}
                  custom={i * 0.1}
                  className='group rounded-3xl border border-[#eee0d2] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60'
                >
                  <div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#E8921A] transition group-hover:bg-[#E8921A] group-hover:text-white'>
                    {v.icon}
                  </div>
                  <h3 className='mb-2 text-lg font-black text-gray-950'>{v.title}</h3>
                  <p className='text-sm leading-relaxed text-gray-500'>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── OFFER CARDS ──────────────────────────────────────── */}
          <section className='pb-24'>
            <motion.div
              variants={fadeUp}
              initial='hidden'
              whileInView='show'
              viewport={{ once: true }}
              className='mb-14 text-center'
            >
              <span className='mb-3 inline-block text-xs font-black uppercase tracking-[0.3em] text-[#E8921A]'>
                Ce que nous proposons
              </span>
              <h2 className='text-4xl font-black tracking-tight text-gray-950 sm:text-5xl'>
                Deux univers, une plateforme
              </h2>
            </motion.div>

            <div className='flex flex-col gap-6'>

              {/* ── Card Immobilier ── */}
              <motion.div
                variants={fadeUp}
                initial='hidden'
                whileInView='show'
                viewport={{ once: true }}
                custom={0}
                className='group grid overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 transition duration-500 hover:shadow-2xl hover:shadow-slate-300/50 lg:grid-cols-[1fr_420px]'
              >
                {/* Content side */}
                <div className='flex flex-col justify-between p-8 sm:p-10 lg:p-12'>
                  <div>
                    {/* Top row */}
                    <div className='mb-8 flex items-center gap-3'>
                      <span className='inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0d3556]'>
                        <svg className='h-5 w-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                        </svg>
                      </span>
                      <span className='rounded-full border border-[#eee0d2] bg-[#fff8f4] px-3 py-1 text-xs font-black uppercase tracking-widest text-[#0d3556]'>
                        Logements
                      </span>
                    </div>

                    <h3 className='text-3xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl'>
                      Trouvez votre logement idéal
                    </h3>
                    <p className='mt-4 max-w-md text-base leading-7 text-gray-500'>
                      Des centaines d'annonces vérifiées — maisons, appartements, studios et villas —
                      partout au Cameroun. Filtrez, comparez et contactez en quelques clics.
                    </p>

                    {/* Feature list */}
                    <ul className='mt-7 space-y-3'>
                      {[
                        'Annonces vérifiées et à jour',
                        'Photos haute qualité et localisation précise',
                        'Contact direct avec le propriétaire',
                        'Recherche par ville, quartier ou budget',
                      ].map(feat => (
                        <li key={feat} className='flex items-center gap-3 text-sm font-semibold text-gray-700'>
                          <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#E8921A]'>
                            <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                            </svg>
                          </span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className='mt-10 flex flex-wrap items-center gap-4'>
                    <Link
                      to='/houses'
                      className='inline-flex items-center gap-2 rounded-full bg-[#0d3556] px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-900/20 transition hover:bg-[#0a2840]'
                    >
                      Explorer les logements
                      <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                      </svg>
                    </Link>
                    <span className='text-xs font-semibold text-gray-400'>500+ annonces disponibles</span>
                  </div>                </div>

                {/* Image side */}
                <div className='relative min-h-72 overflow-hidden lg:min-h-0'>
                  <img
                    src='https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900'
                    alt='Immobilier au Cameroun'
                    className='h-full w-full object-cover transition duration-700 group-hover:scale-105'
                  />
                  {/* Category chips */}
                  <div className='absolute right-4 top-4 flex flex-col gap-2'>
                    {['Maisons', 'Appartements', 'Studios'].map(tag => (
                      <span key={tag} className='rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#0d3556] shadow backdrop-blur'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── Card Mobilier ── */}
              <motion.div
                variants={fadeUp}
                initial='hidden'
                whileInView='show'
                viewport={{ once: true }}
                custom={0.1}
                className='group grid overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 transition duration-500 hover:shadow-2xl hover:shadow-slate-300/50 lg:grid-cols-[420px_1fr]'
              >
                {/* Image side — left on this card for visual alternation */}
                <div className='relative order-last min-h-72 overflow-hidden lg:order-first lg:min-h-0'>
                  <img
                    src='https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=900'
                    alt='Mobilier design'
                    className='h-full w-full object-cover transition duration-700 group-hover:scale-105'
                  />
                  {/* Category chips */}
                  <div className='absolute left-4 top-4 flex flex-col gap-2'>
                    {['Neuf', 'Occasion', 'Déco'].map(tag => (
                      <span key={tag} className='rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#E8921A] shadow backdrop-blur'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content side */}
                <div className='flex flex-col justify-between p-8 sm:p-10 lg:p-12'>
                  <div>
                    {/* Top row */}
                    <div className='mb-8 flex items-center gap-3'>
                      <span className='inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8921A]'>
                        <svg className='h-5 w-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
                        </svg>
                      </span>
                      <span className='rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#E8921A]'>
                        Mobilier
                      </span>
                    </div>

                    <h3 className='text-3xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl'>
                      Équipez votre intérieur avec style
                    </h3>
                    <p className='mt-4 max-w-md text-base leading-7 text-gray-500'>
                      Meubles et accessoires neufs ou d'occasion à prix accessibles. Trouvez la pièce
                      parfaite pour chaque espace de votre maison.
                    </p>

                    {/* Feature list */}
                    <ul className='mt-7 space-y-3'>
                      {[
                        'Large choix neuf et occasion',
                        'Prix négociables entre particuliers',
                        'Livraison disponible selon vendeur',
                        'Catégories : salon, chambre, cuisine…',
                      ].map(feat => (
                        <li key={feat} className='flex items-center gap-3 text-sm font-semibold text-gray-700'>
                          <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#E8921A]'>
                            <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                            </svg>
                          </span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className='mt-10 flex flex-wrap items-center gap-4'>
                    <Link
                      to='/furnitures'
                      className='inline-flex items-center gap-2 rounded-full bg-[#E8921A] px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-900/20 transition hover:bg-orange-600'
                    >
                      Découvrir le mobilier
                      <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>

            </div>
          </section>

          {/* ── CTA BAND ─────────────────────────────────────────── */}
          <motion.section
            variants={fadeUp}
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
            className='mb-10 overflow-hidden rounded-[2rem] bg-[#0d3556] text-white shadow-2xl shadow-slate-900/20'
          >
            <div className='grid lg:grid-cols-[1.1fr_1fr]'>
              <div className='flex flex-col justify-center px-8 py-10 sm:px-12 lg:py-12'>
                <span className='mb-4 text-xs font-black uppercase tracking-[0.35em] text-orange-300'>
                  Rejoignez Domilix
                </span>
                <h2 className='max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[2.6rem]'>
                  Votre prochain chez-vous commence ici
                </h2>
                <p className='mt-4 max-w-lg text-base font-medium leading-7 text-white/75 sm:text-lg'>
                  Des annonces claires, des contacts utiles et une expérience fluide
                  du premier clic jusqu'au contact.
                </p>
                <div className='mt-8 flex flex-wrap gap-3'>
                  <Link
                    to='/houses'
                    className='rounded-full bg-[#E8921A] px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-500'
                  >
                    Explorer les annonces
                  </Link>
                  <Link
                    to='/settings?tab=announcer'
                    className='rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white hover:text-[#0d3556]'
                  >
                    Devenir annonceur
                  </Link>
                </div>
              </div>

              <div className='grid h-64 grid-rows-[1fr_0.75fr] border-t border-white/10 lg:h-auto lg:border-l lg:border-t-0'>
                <div className='relative overflow-hidden'>
                  <img
                    src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900'
                    alt='Remise des clés'
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='grid grid-cols-2 border-t border-white/20'>
                  <div className='relative overflow-hidden border-r border-white/20'>
                    <img
                      src='https://images.unsplash.com/photo-1551434678-e076c223a692?w=700'
                      alt='Recherche mobile'
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <div className='relative overflow-hidden'>
                    <img
                      src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700'
                      alt='Maison moderne'
                      className='h-full w-full object-cover'
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── NEWSLETTER ───────────────────────────────────────── */}
          <motion.section
            variants={fadeUp}
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
            className='relative mb-24 overflow-hidden rounded-[2rem] bg-[#a91632] px-6 py-14 text-center shadow-xl shadow-red-950/20 sm:rounded-[2.5rem] sm:px-10 sm:py-16 lg:px-16'
          >
            {/* Decorative arcs */}
            {[0, 1].map(side => (
              <svg
                key={side}
                className={`pointer-events-none absolute ${side === 0 ? 'left-6 top-4' : '-right-4 bottom-5 rotate-180'} h-36 w-36 text-white/10 sm:h-52 sm:w-52`}
                viewBox='0 0 180 180'
                fill='none'
                aria-hidden='true'
              >
                <path d='M156 13c-53 0-80 27-80 80 0 39-20 59-59 59' stroke='currentColor' strokeWidth='1.2' />
                <path d='M163 24c-48 0-72 24-72 72 0 33-17 50-50 50' stroke='currentColor' strokeWidth='1.2' />
                <path d='M170 35c-43 0-64 21-64 64 0 27-14 41-41 41' stroke='currentColor' strokeWidth='1.2' />
              </svg>
            ))}

            <div className='relative mx-auto max-w-2xl'>
              <span className='mb-4 inline-block text-xs font-black uppercase tracking-[0.3em] text-white/60'>
                Newsletter
              </span>
              <h2 className='text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl'>
                Restez informé des meilleures annonces
              </h2>
              <p className='mx-auto mt-4 max-w-md text-base text-white/70'>
                Recevez les nouvelles annonces et actualités Domilix directement dans votre boîte mail.
              </p>

              <form onSubmit={handleNewsletterSubmit} className='mx-auto mt-8 max-w-xl'>
                <HoneypotInput value={newsletterWebsite} onChange={setNewsletterWebsite} />
                <div className='flex min-h-14 overflow-hidden rounded-full bg-white/90 p-1.5 shadow-inner backdrop-blur sm:min-h-16'>
                  <input
                    type='email'
                    value={newsletterEmail}
                    onChange={event => setNewsletterEmail(event.target.value)}
                    className='min-w-0 flex-1 rounded-full bg-transparent px-5 text-base font-semibold text-gray-800 outline-none placeholder:text-gray-400 sm:px-6'
                    placeholder='Votre adresse email'
                    required
                  />
                  <button
                    type='submit'
                    disabled={newsletterLoading}
                    className='shrink-0 rounded-full bg-[#a91632] px-6 py-2.5 text-sm font-black text-white transition hover:bg-[#8f1029] disabled:bg-gray-400 sm:px-8'
                  >
                    {newsletterLoading ? 'Envoi...' : "S'inscrire"}
                  </button>
                </div>

                {newsletterMessage && (
                  <p className='mt-4 rounded-2xl bg-white/90 px-5 py-3 text-sm font-semibold text-green-700'>
                    {newsletterMessage}
                  </p>
                )}
                {newsletterError && (
                  <p className='mt-4 rounded-2xl bg-white/90 px-5 py-3 text-sm font-semibold text-red-700'>
                    {newsletterError}
                  </p>
                )}

                <p className='mx-auto mt-5 max-w-sm text-xs font-medium leading-5 text-white/50'>
                  Votre confidentialité compte. Nous protégeons vos informations pour une expérience sécurisée.
                </p>
              </form>
            </div>
          </motion.section>

        </div>
      </main>

      <Footer2 />
    </>
  );
}
