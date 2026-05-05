'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiEnvelope,
  HiHomeModern,
} from 'react-icons/hi2';
import Nav2 from '@components/Nav2/Nav2';
import Footer2 from '@components/Footer2/Footer2';
import { Link } from '@router';
import { newsletterApi } from '@services/newsletterApi';

export default function About(): React.ReactElement {
  const [newsletterEmail, setNewsletterEmail] = useState('');
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
      const response = await newsletterApi.subscribe(email);
      setNewsletterMessage(response.message || 'Inscription a la newsletter reussie.');
      setNewsletterEmail('');
    } catch (error: any) {
      setNewsletterError(error.response?.data?.message || error.response?.data?.email?.[0] || "Impossible de vous inscrire a la newsletter.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <>
      <Nav2 />
      <div className='min-h-screen bg-white pt-16'>
        {/* Hero Section with Image Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='relative overflow-hidden'
        >
          {/* Image Grid Background */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2 h-[34rem] md:h-[42rem] lg:h-[48rem]'>
            <div className='relative overflow-hidden'>
              <img
                src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'
                alt='Maison moderne'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='relative overflow-hidden'>
              <img
                src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'
                alt='Intérieur salon'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='relative overflow-hidden'>
              <img
                src='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'
                alt='Appartement'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='relative overflow-hidden'>
              <img
                src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
                alt='Mobilier'
                className='w-full h-full object-cover'
              />
            </div>
          </div>

          {/* Overlay with Title */}
          <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 flex items-center justify-center'>
            <div className='text-center px-4'>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className='text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tight'
              >
                À propos de Domilix
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className='text-2xl md:text-4xl lg:text-5xl text-white/90 max-w-5xl mx-auto font-light leading-tight'
              >
                Votre partenaire de confiance pour l'immobilier et le mobilier
                au Cameroun
              </motion.p>
            </div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-20'
          >
            <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-8'>
              Notre Mission
            </h2>
            <p className='text-2xl md:text-3xl text-gray-700 max-w-5xl mx-auto leading-relaxed font-light'>
              Révolutionner le marché immobilier et du mobilier au Cameroun en
              créant une plateforme sécurisée, transparente et innovante qui
              connecte propriétaires, annonceurs et chercheurs de biens.
            </p>
            <p className='text-2xl md:text-3xl text-gray-700 max-w-5xl mx-auto leading-relaxed font-light mt-6'>
              Nous croyons que chacun mérite de trouver son chez-soi idéal et
              les meubles parfaits pour le rendre unique.
            </p>
          </motion.div>

          {/* Values Section with Images */}
          <div className='grid md:grid-cols-2 gap-12 mb-20'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='space-y-6'
            >
              <div className='rounded-2xl overflow-hidden shadow-xl'>
                <img
                  src='https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600'
                  alt='Immobilier'
                  className='w-full h-64 object-cover'
                />
              </div>
              <div>
                <h3 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                  Immobilier
                </h3>
                <p className='text-xl md:text-2xl text-gray-700 leading-relaxed font-light'>
                  Des milliers de propriétés disponibles à la location et à la
                  vente. Maisons, appartements, studios, villas - trouvez
                  l'espace qui correspond à vos besoins et votre budget.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='space-y-6'
            >
              <div className='rounded-2xl overflow-hidden shadow-xl'>
                <img
                  src='https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600'
                  alt='Mobilier'
                  className='w-full h-64 object-cover'
                />
              </div>
              <div>
                <h3 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                  Mobilier
                </h3>
                <p className='text-xl md:text-2xl text-gray-700 leading-relaxed font-light'>
                  Découvrez une large sélection de meubles et d'accessoires pour
                  votre intérieur. Du mobilier neuf aux pièces d'occasion de
                  qualité, meublez votre espace avec style.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='overflow-hidden rounded-[2rem] bg-[#0d3556] text-white shadow-2xl'
          >
            <div className='grid lg:grid-cols-[1.08fr_1fr]'>
              <div className='flex flex-col justify-center px-8 py-10 sm:px-12 lg:px-14 lg:py-16'>
                <p className='mb-6 text-xs font-black uppercase tracking-[0.45em] text-orange-300 sm:text-sm'>
                  Confiance au quotidien
                </p>
                <h2 className='max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl'>
                  Trouver un logement devient simple, clair et rassurant
                </h2>
                <div className='mt-8 space-y-5 text-lg font-semibold leading-8 text-white/90 sm:text-xl'>
                  <p>
                    Domilix relie des personnes réelles à des biens réels. Chaque recherche s'inscrit dans une expérience fluide, transparente et facile à suivre.
                  </p>
                  <p>
                    Pour le locataire comme pour l'annonceur, la plateforme aide à avancer avec plus de confiance, du premier coup d'oeil jusqu'au contact.
                  </p>
                </div>
                <div className='mt-9 flex flex-wrap gap-4'>
                  <Link
                    to='/houses'
                    className='rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600'
                  >
                    Explorer les annonces
                  </Link>
                  <Link
                    to='/settings?tab=announcer'
                    className='rounded-full bg-white/10 px-6 py-3 text-sm font-black text-white ring-1 ring-white/25 transition hover:bg-white hover:text-[#0d3556]'
                  >
                    Devenir annonceur
                  </Link>
                </div>
              </div>

              <div className='grid min-h-[420px] grid-rows-[1.15fr_1fr] border-t border-white/10 lg:border-l lg:border-t-0'>
                <div className='relative overflow-hidden'>
                  <img
                    src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900'
                    alt='Remise des clés d’un logement'
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='grid grid-cols-2 border-t border-white/80'>
                  <div className='relative overflow-hidden border-r border-white/80'>
                    <img
                      src='https://images.unsplash.com/photo-1551434678-e076c223a692?w=700'
                      alt='Recherche de logement sur mobile'
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <div className='relative overflow-hidden'>
                    <img
                      src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700'
                      alt='Maison moderne au coucher du soleil'
                      className='h-full w-full object-cover'
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='relative mt-10 overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-slate-50 p-8 shadow-xl shadow-orange-100/50 sm:p-10 lg:p-12'
          >
            <div className='absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-200/40 blur-3xl' />
            <div className='absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-slate-200/60 blur-3xl' />

            <div className='relative grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center'>
              <div>
                <div className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200'>
                  <HiEnvelope className='h-7 w-7' />
                </div>
                <p className='text-xs font-black uppercase tracking-[0.35em] text-orange-500'>
                  Newsletter
                </p>
                <h2 className='mt-3 max-w-2xl text-3xl font-black tracking-tight text-gray-950 sm:text-4xl lg:text-5xl'>
                  Recevez les meilleures opportunites Domilix avant tout le monde
                </h2>
                <p className='mt-5 max-w-2xl text-lg leading-8 text-gray-600'>
                  Nouveaux logements, meubles interessants, conseils pratiques et actualites de la plateforme directement dans votre boite mail.
                </p>
              </div>

              <form onSubmit={handleNewsletterSubmit} className='rounded-3xl border border-white bg-white/80 p-5 shadow-lg shadow-slate-200/60 backdrop-blur'>
                <label className='block text-sm font-bold text-gray-700'>
                  Votre adresse email
                  <div className='mt-3 flex flex-col gap-3 sm:flex-row'>
                    <input
                      type='email'
                      value={newsletterEmail}
                      onChange={event => setNewsletterEmail(event.target.value)}
                      className='min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      placeholder='john@example.com'
                      required
                    />
                    <button
                      type='submit'
                      disabled={newsletterLoading}
                      className='rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:bg-gray-400'
                    >
                      {newsletterLoading ? 'Envoi...' : "S'inscrire"}
                    </button>
                  </div>
                </label>

                {newsletterMessage && (
                  <p className='mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700'>
                    {newsletterMessage}
                  </p>
                )}
                {newsletterError && (
                  <p className='mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700'>
                    {newsletterError}
                  </p>
                )}

                <div className='mt-5 flex items-center gap-3 text-sm font-semibold text-gray-500'>
                  <HiHomeModern className='h-5 w-5 text-orange-500' />
                  <span>Immobilier, mobilier et conseils utiles. Pas de spam.</span>
                </div>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
      <Footer2 />
    </>
  );
}
