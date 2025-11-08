import Footer from '@components/Footer/footer';
import Footer2 from '@components/Footer2/Footer2';
import Header from '@components/Header/header';
import Newslater from '@components/Newslater/Newslater';
import Services from '@components/services/Services';
import Stats from '@components/Stats/Stats';
import React from 'react';
import { motion } from 'framer-motion';
import Contact from '@components/Contact/Contact';

import img10 from '@assets/bg_img/img10.png';

function HomeProducts() {
  return (
    <>
      <section className='w-full mt-20'>
        <div className='px-4 sm:px-6 lg:px-8 2xl:mx-[190px]'>
          <div className='py-8 md:py-12 flex flex-col'>
            <div className='flex flex-col text-center px-4 sm:px-8 md:px-16 lg:px-72 mb-12 md:mb-24'>
              <h2 className='font-bold text-[#0D2E4F] text-3xl/tight sm:text-4xl/tight lg:text-5xl/tight'>
                Some Properties
              </h2>
              <p className='font-light text-[#989898] mt-4'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10'>
              {[...Array(6)].map((_, index) => (
                <div key={index} className='mx-auto'>
                  <div className='w-full max-w-[350px] bg-[#ffffff] shadow-lg rounded-sm overflow-hidden'>
                    <div className='w-full h-[200px]'>
                      <img
                        className='w-full h-full object-cover'
                        src={img10}
                        alt=''
                      />
                    </div>
                    <div className='px-4 flex items-start gap-4 font-light text-[#989898] text-sm border-b border-[#989898] py-2 mb-2 flex-wrap'>
                      <p>5 Rooms</p>
                      <p>2 Baths</p>
                      <p>5 Rooms</p>
                      <p>1100 M SqT</p>
                    </div>
                    <div className='px-4 flex flex-col gap-2 border-b border-[#989898] pb-2'>
                      <h3 className='font-semibold text-2xl sm:text-3xl text-[#000000]'>
                        Room Title
                      </h3>
                      <p className='font-light text-base text-[#989898]'>
                        Lorem ipsum dolor sit amet, consectetur sed adipiscing
                        elit, why do eiusmod tempor incididunt.
                      </p>
                    </div>
                    <div className='px-4 flex justify-between items-center w-full py-3'>
                      <span className='font-semibold text-[#000000]'>
                        350,000FCFA
                      </span>
                      <button className='text-white capitalize bg-orange-700 hover:bg-orange-800 transition-colors py-2 px-4 rounded-sm'>
                        view details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const FeatureSection = () => (
  <section className='py-20 bg-white relative overflow-hidden'>
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid lg:grid-cols-2 gap-12 items-center'>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className='space-y-8'
        >
          <h2 className='text-3xl font-bold text-gray-900'>
            Une approche innovante de la recherche immobilière
          </h2>
          <div className='space-y-8'>
            {[
              {
                title: 'Système de Crédits Intelligent',
                description:
                  'Accédez aux informations détaillées des biens qui vous intéressent grâce à notre système de crédits sécurisé.',
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                ),
              },
              {
                title: 'Sécurité et Confidentialité',
                description:
                  'Protection garantie des informations sensibles pour les propriétaires et les acheteurs.',
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                ),
              },
              {
                title: 'Recherche Avancée',
                description:
                  'Filtrez les biens selon vos critères spécifiques et accédez aux visites virtuelles.',
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                ),
              },
              {
                title: 'Alertes Personnalisées',
                description:
                  'Recevez des notifications en temps réel pour les nouveaux biens correspondant à vos critères.',
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                    />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className='flex gap-6'
              >
                <div className='flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500'>
                  {feature.icon}
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-800 font-ligth '>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className='relative'
        >
          <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
            <div className='absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20' />
            <img
              src='/assets/app-features.png'
              alt='Fonctionnalités Domilix'
              className='w-full'
            />
          </div>

          {/* Carte flottante des crédits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl'
          >
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-orange-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Système de crédits</p>
                <p className='text-lg font-semibold text-gray-900'>
                  100% Sécurisé
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default function Home(): React.ReactElement {
  return (
    <>
      <Header />

      <HomeProducts />
      <Services />
      <FeatureSection />

      {/* <Stats /> */}
      <Footer />
      <Footer2 />
    </>
  );
}
