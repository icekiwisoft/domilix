'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Footer2 from '@components/Footer2/Footer2';
import HoneypotInput from '@components/HoneypotInput/HoneypotInput';
import Nav2 from '@components/Nav2/Nav2';
import { Link } from '@router';
import { newsletterApi } from '@services/newsletterApi';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const heroImage = '/images/about-hero.png';
const teamImage = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200';
const ctaImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200';

const VALUES = [
  {
    title: 'Intégrité',
    desc: 'La confiance est le socle de Domilix. Nous valorisons les annonces claires, les informations utiles et les relations transparentes.',
    icon: (
      <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M9 12l2 2 4-4m5.6-4A12 12 0 0 1 12 3 12 12 0 0 1 3.4 6 12 12 0 0 0 3 9c0 5.6 3.8 10.3 9 11.6 5.2-1.3 9-6 9-11.6 0-1-.1-2-.4-3Z' />
      </svg>
    ),
  },
  {
    title: 'Innovation',
    desc: 'Nous combinons technologie, recherche locale et outils simples pour rendre le logement plus accessible au quotidien.',
    icon: (
      <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M12 3v1m6.4 1.6-.8.8M21 12h-1M4 12H3m3.4-6.4.8.8M9 18h6m-5 3h4m-7.1-7.1a5 5 0 1 1 7.1 0c-.6.6-1 1.5-1 2.4h-2c0-.9-.4-1.8-1.1-2.4Z' />
      </svg>
    ),
  },
  {
    title: 'Proximité',
    desc: 'Domilix reste ancrée dans les réalités locales : villes, quartiers, budgets, annonceurs et besoins du terrain.',
    icon: (
      <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M17 20h5v-2a3 3 0 0 0-5.4-1.8M17 20H7m10 0v-2c0-.7-.1-1.3-.4-1.8M7 20H2v-2a3 3 0 0 1 5.4-1.8M7 20v-2c0-.7.1-1.3.4-1.8m0 0a5 5 0 0 1 9.2 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
      </svg>
    ),
  },
];

const STATS = [
  { value: '500+', label: 'Annonces' },
  { value: '24/7', label: 'Accès' },
  { value: '100%', label: 'Local' },
];

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

      <main className='min-h-screen bg-[#f7f9fb] text-[#191c1e]'>
        <section className='relative flex min-h-[70vh] items-center justify-center overflow-hidden pt-20'>
          <div className='absolute inset-0'>
            <img src={heroImage} alt='Visite immobiliere Domilix' className='h-full w-full object-cover object-center' />
            <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10' />
            <div className='absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f7f9fb] to-transparent' />
          </div>

          <div className='relative z-10 mx-auto max-w-5xl px-gutter py-xl text-left'>
            <motion.span
              variants={fadeUp}
              initial='hidden'
              animate='show'
              custom={0.1}
              className='mb-md inline-flex rounded-full border border-white/20 bg-white/10 px-md py-sm text-xs font-bold uppercase tracking-[0.3em] text-white/75 backdrop-blur'
            >
              Qui sommes-nous
            </motion.span>
            <motion.h1
              variants={fadeUp}
              initial='hidden'
              animate='show'
              custom={0.2}
              className='max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl'
            >
              Votre partenaire immobilier de confiance
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial='hidden'
              animate='show'
              custom={0.3}
              className='mt-md max-w-2xl text-base leading-8 text-white/80 sm:text-xl'
            >
              Domilix redéfinit l'expérience immobilière en reliant les besoins réels du marché camerounais à une plateforme simple, claire et fiable.
            </motion.p>
          </div>
        </section>

        <section className='bg-[#131b2e] py-xl text-white'>
          <div className='mx-auto max-w-container px-gutter'>
            <div className='grid gap-xl md:grid-cols-2 md:items-start'>
              <motion.div variants={fadeUp} initial='hidden' whileInView='show' viewport={{ once: true }} className='space-y-md'>
                <span className='text-xs font-bold uppercase tracking-[0.28em] text-[#ff5f1f]'>Notre mission</span>
                <h2 className='max-w-lg text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl'>Simplifier la recherche, amplifier la confiance</h2>
                <p className='max-w-xl text-base leading-8 text-white/70'>
                  Nous aidons les chercheurs de logement, les propriétaires et les annonceurs à gagner du temps grâce à des annonces lisibles, des contacts utiles et une expérience fluide du premier clic jusqu'au contact.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} initial='hidden' whileInView='show' viewport={{ once: true }} custom={0.1} className='space-y-md border-l-4 border-[#ff5f1f] pl-lg'>
                <span className='text-xs font-bold uppercase tracking-[0.28em] text-[#ff5f1f]'>Notre vision</span>
                <h2 className='max-w-lg text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl'>L'immobilier local, plus direct et plus moderne</h2>
                <p className='max-w-xl text-base leading-8 text-white/70'>
                  Domilix veut devenir la référence digitale pour trouver, publier et valoriser les biens immobiliers et mobiliers au Cameroun, avec une approche pratique, accessible et ancrée dans les quartiers.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className='bg-[#f2f4f6] px-gutter py-xl'>
          <div className='mx-auto max-w-container'>
            <motion.div variants={fadeUp} initial='hidden' whileInView='show' viewport={{ once: true }} className='mb-xl text-center'>
              <h2 className='text-3xl font-bold tracking-tight text-[#191c1e] sm:text-4xl'>Nos valeurs fondamentales</h2>
              <div className='mx-auto mt-sm h-1 w-20 rounded-full bg-[#ab3600]' />
            </motion.div>

            <div className='grid gap-md md:grid-cols-3'>
              {VALUES.map((value, index) => (
                <motion.article
                  key={value.title}
                  variants={fadeUp}
                  initial='hidden'
                  whileInView='show'
                  viewport={{ once: true }}
                  custom={index * 0.08}
                  className='group rounded-xl bg-white p-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl'
                >
                  <div className='mb-md flex h-16 w-16 items-center justify-center rounded-lg bg-[#ab3600] text-white transition-colors group-hover:bg-[#ff5f1f]'>
                    {value.icon}
                  </div>
                  <h3 className='mb-base text-2xl font-bold text-black'>{value.title}</h3>
                  <p className='text-sm leading-7 text-[#5b4138]'>{value.desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className='mx-auto max-w-container overflow-hidden px-gutter py-xl'>
          <div className='grid gap-lg md:grid-cols-12 md:items-center'>
            <motion.div variants={fadeUp} initial='hidden' whileInView='show' viewport={{ once: true }} className='space-y-md md:col-span-5'>
              <span className='text-xs font-bold uppercase tracking-[0.28em] text-[#ab3600]'>Notre équipe</span>
              <h2 className='text-3xl font-bold leading-tight tracking-tight text-[#191c1e] sm:text-4xl'>L'humain au cœur de l'immobilier</h2>
              <p className='text-lg leading-8 text-[#5b4138]'>
                Derrière Domilix, une équipe construit des outils simples pour mieux connecter les personnes, les biens et les opportunités.
              </p>
              <div className='flex flex-wrap gap-md py-base'>
                {STATS.map(stat => (
                  <div key={stat.label} className='min-w-24 text-center'>
                    <div className='text-3xl font-black text-black'>{stat.value}</div>
                    <div className='mt-xs text-xs font-bold uppercase tracking-[0.16em] text-[#5b4138]'>{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial='hidden' whileInView='show' viewport={{ once: true }} custom={0.1} className='relative md:col-span-7'>
              <div className='relative overflow-hidden rounded-[1.5rem] shadow-xl transition-transform duration-500 hover:rotate-0 md:rotate-2'>
                <img src={teamImage} alt='Équipe Domilix' className='h-[360px] w-full object-cover sm:h-[450px]' />
              </div>
              <div className='absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-full bg-black/10' />
            </motion.div>
          </div>
        </section>

        <section className='bg-[#131b2e] px-gutter py-xl'>
          <motion.div variants={fadeUp} initial='hidden' whileInView='show' viewport={{ once: true }} className='mx-auto max-w-container overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 text-white shadow-2xl shadow-black/20 backdrop-blur-md'>
            <div className='grid lg:grid-cols-[1.1fr_0.9fr]'>
              <div className='p-lg sm:p-xl'>
                <span className='text-xs font-bold uppercase tracking-[0.28em] text-[#ff5f1f]'>Prêt à avancer ?</span>
                <h2 className='mt-md max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-4xl'>Transformez votre recherche immobilière avec Domilix</h2>
                <p className='mt-md max-w-2xl text-base leading-8 text-white/70'>
                  Trouvez un bien, publiez une annonce ou commencez à valoriser votre patrimoine avec une plateforme pensée pour le terrain.
                </p>
                <div className='mt-lg flex flex-col gap-md sm:flex-row'>
                  <Link to='/houses' className='rounded-lg bg-[#ff5f1f] px-xl py-4 text-center text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-orange-950/30 transition hover:scale-105 hover:bg-orange-600'>
                    Voir nos biens
                  </Link>
                  <Link to='/settings?tab=announcer' className='rounded-lg border-2 border-white/35 px-xl py-4 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black'>
                    Devenir partenaire
                  </Link>
                </div>
              </div>
              <div className='relative min-h-80 overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0'>
                <img src={ctaImage} alt='Maison moderne' className='h-full w-full object-cover' />
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
              </div>
            </div>
          </motion.div>
        </section>

        <section className='bg-[#f7f9fb] px-gutter py-xl'>
          <motion.div variants={fadeUp} initial='hidden' whileInView='show' viewport={{ once: true }} className='mx-auto max-w-container rounded-[1.5rem] bg-[#a91632] p-lg text-center text-white shadow-xl shadow-red-950/20 sm:p-xl'>
            <span className='mb-md inline-block text-xs font-bold uppercase tracking-[0.3em] text-white/60'>Newsletter</span>
            <h2 className='mx-auto max-w-2xl text-3xl font-black leading-tight sm:text-5xl'>Restez informé des meilleures annonces</h2>
            <p className='mx-auto mt-md max-w-xl text-base leading-7 text-white/70'>
              Recevez les nouvelles annonces et actualités Domilix directement dans votre boîte mail.
            </p>

            <form onSubmit={handleNewsletterSubmit} className='mx-auto mt-lg max-w-xl'>
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
                <p className='mt-md rounded-2xl bg-white/90 px-5 py-3 text-sm font-semibold text-green-700'>
                  {newsletterMessage}
                </p>
              )}
              {newsletterError && (
                <p className='mt-md rounded-2xl bg-white/90 px-5 py-3 text-sm font-semibold text-red-700'>
                  {newsletterError}
                </p>
              )}
            </form>
          </motion.div>
        </section>
      </main>

      <Footer2 />
    </>
  );
}
