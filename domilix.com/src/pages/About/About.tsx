import React from 'react';
import { motion } from 'framer-motion';
import {
  HiShieldCheck,
  HiCreditCard,
  HiMagnifyingGlass,
  HiHome,
  HiUsers,
  HiSparkles,
  HiMapPin,
  HiChatBubbleLeftRight,
} from 'react-icons/hi2';
import Nav2 from '@components/Nav2/Nav2';
import Footer2 from '@components/Footer2/Footer2';
import { Link } from 'react-router-dom';

export default function About(): React.ReactElement {
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
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2 h-64 md:h-80'>
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
                className='text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4'
              >
                À propos de Domilix
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className='text-2xl md:text-3xl lg:text-4xl text-white/90 max-w-4xl mx-auto font-light'
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center bg-gray-50 p-12 rounded-3xl'
          >
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
              Prêt à trouver votre bien idéal ?
            </h2>
            <p className='text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto font-light'>
              Rejoignez Domilix aujourd'hui et découvrez une nouvelle façon de
              chercher votre logement ou vos meubles au Cameroun.
            </p>
            <div className='flex flex-wrap gap-4 justify-center'>
              <Link
                to='/houses'
                className='bg-orange-500 text-white px-8 py-4 rounded-xl hover:bg-orange-600 transition-colors font-semibold'
              >
                Explorer les annonces
              </Link>
              <Link
                to='/subscriptions'
                className='bg-white text-orange-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold border-2 border-orange-500'
              >
                Devenir annonceur
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer2 />
    </>
  );
}
