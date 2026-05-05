import ChoiseMode from '@components/Cards/Paiement/ChoiseMode';
import Footer2 from '@components/Footer2/Footer2';
import Nav2 from '@components/Nav2/Nav2';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaCheck, FaPlus } from 'react-icons/fa';
import { PricingProps } from 'utils/types';
import { useAuth } from '../../hooks/useAuth';
import { signinDialogActions } from '@stores/defineStore';

const options = [
  "Voir les informations de base d'une annonce.",
  'Partagez les annonces avec vos contacts.',
];

const PricingCard: React.FC<PricingProps> = ({
  title,
  credits,
  validity,
  price,
  features,
  isActive,
  onChoose,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02 }}
    className={`p-8 rounded-2xl shadow-lg relative backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl
      ${
        isActive
          ? 'bg-gradient-to-br from-indigo-950 to-indigo-900 text-white lg:-translate-y-6'
          : 'bg-white/90 hover:bg-white'
      }`}
  >
    {isActive && (
      <>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className='absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-indigo-950 shadow-xl ring-1 ring-orange-200'
        >
          Plus populaire
        </motion.div>
        <motion.div
          initial={{ scale: 0, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          className='absolute -top-4 -right-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-2xl ring-4 ring-white/20'
        >
          <div className='text-center leading-none'>
            <div className='text-lg font-black'>-12%</div>
            <div className='mt-0.5 text-[9px] font-bold uppercase tracking-wide'>promo</div>
          </div>
        </motion.div>
      </>
    )}

    <h2 className='text-2xl font-bold mb-6'>{title}</h2>

    <div className='space-y-4 mb-8'>
      <div className='flex items-center gap-3'>
        <img className='w-6 h-6' src='dom.png' alt='Credits' />
        <span className='text-lg'>{credits}</span>
      </div>

      <div className='flex items-center gap-3'>
        <svg
          className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-orange-400' : 'text-orange-500'}`}
          viewBox='0 0 24 24'
          fill='none'
          aria-hidden='true'
        >
          <rect
            x='4'
            y='5'
            width='16'
            height='15'
            rx='4'
            className={isActive ? 'fill-white/10' : 'fill-orange-50'}
          />
          <path
            d='M8 3v4M16 3v4M4 9h16'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
          />
          <path
            d='M9 14.5l2 2 4-5'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        <span className='text-lg'>{validity}</span>
      </div>
    </div>

    <ul
      className={`space-y-4 mb-8 ${isActive ? 'text-gray-300' : 'text-gray-600'}`}
    >
      {options.map((feature, index) => (
        <motion.li
          key={index}
          className='flex items-start gap-3'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span className='mt-1'>
            {features.includes(feature) ? (
              <FaCheck className='text-orange-500' size={12} />
            ) : (
              <FaPlus className='rotate-45 opacity-50' size={12} />
            )}
          </span>
          <span className='text-sm'>{feature}</span>
        </motion.li>
      ))}
    </ul>

    <div className='mb-8'>
      <span className='text-3xl font-bold'>{price}</span>
      <span className='text-sm ml-2'>XAF</span>
    </div>

    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onChoose}
      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300
        ${
          isActive
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
        }`}
    >
      Choisir ce pack
    </motion.button>
  </motion.div>
);

export default function Subscriptions() {
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const { isAuthenticated } = useAuth();

  const handleChooseOffer = (offer: any) => {
    if (!isAuthenticated) {
      signinDialogActions.toggle();
      return;
    }

    setSelectedOffer(offer);
  };

  return (
    <>
      <Nav2 />
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-center max-w-3xl mx-auto mb-12'
          >
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
              Le bon plan pour votre recherche
            </h1>
            <p className='text-lg text-gray-600'>
              Nous mettons à votre disposition plusieurs plans puissants pour
              vous aider à trouver un logement et un espace de bureau à un prix
              abordable.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto'>
            <PricingCard
              title='Pack Standard'
              credits='20 credits'
              validity='1 semaine de validité'
              price='1000'
              features={["Voir les informations de base d'une annonce."]}
              isActive={false}
              onChoose={() =>
                handleChooseOffer({
                  title: 'Pack Standard',
                  credits: '20 credits',
                  validity: '1 semaine de validité',
                  price: '1000 ',
                  features: ["Voir les informations de base d'une annonce."],
                })
              }
            />
            <PricingCard
              title='Pack Avantage'
              credits='50 credits'
              validity='2 semaines de validité'
              price='2000'
              features={["Voir les informations de base d'une annonce."]}
              isActive={false}
              onChoose={() =>
                handleChooseOffer({
                  title: 'Pack Avantage',
                  credits: '50 credits',
                  validity: '2 semaines de validité',
                  price: '2000',
                  features: ["Voir les informations de base d'une annonce."],
                })
              }
            />
            <PricingCard
              title='Pack Premium'
              credits='100 credits'
              validity='3 semaines de validité'
              price='3500'
              features={[
                "Voir les informations de base d'une annonce.",
                'Partagez les annonces avec vos contacts.',
              ]}
              isActive={true}
              onChoose={() =>
                handleChooseOffer({
                  title: 'Pack Premium',
                  credits: '100 credits',
                  validity: '3 semaines de validité',
                  price: '3500',
                  features: [
                    "Voir les informations de base d'une annonce.",
                    'Partagez les annonces avec vos contacts.',
                  ],
                })
              }
            />
            <PricingCard
              title='Pack Ultime'
              credits='150 credits'
              validity='4 semaines de validité'
              price='5000'
              features={[
                "Voir les informations de base d'une annonce.",
                'Partagez les annonces avec vos contacts.',
              ]}
              isActive={false}
              onChoose={() =>
                handleChooseOffer({
                  title: 'Pack Ultime',
                  credits: '150 credits',
                  validity: '4 semaines de validité',
                  price: '5000',
                  features: [
                    "Voir les informations de base d'une annonce.",
                    'Partagez les annonces avec vos contacts.',
                  ],
                })
              }
            />
          </div>
        </div>
      </div>

      {selectedOffer && (
        <ChoiseMode
          title={selectedOffer.title}
          credit={selectedOffer.credits}
          validity={selectedOffer.validity}
          price={selectedOffer.price}
          features={selectedOffer.features}
          onClose={() => setSelectedOffer(null)}
        />
      )}
      <Footer2 />
    </>
  );
}
