import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome, HiShoppingBag, HiCreditCard, HiUserGroup, HiShieldCheck, HiBell } from 'react-icons/hi2';

function Services(): React.ReactElement {
  const services = [
    {
      icon: HiHome,
      title: "Immobilier",
      description: "Trouvez votre maison idéale parmi notre sélection de biens vérifiés",
      features: ["Biens vérifiés", "Photos HD", "Visites virtuelles"],
      link: "/houses",
      buttonText: "Explorer les biens",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: HiShoppingBag,
      title: "Mobilier",
      description: "Meublez votre intérieur avec notre collection exclusive",
      features: ["Design unique", "Prix compétitifs", "Livraison rapide"],
      link: "/furnitures",
      buttonText: "Voir le mobilier",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: HiCreditCard,
      title: "Système de Crédits",
      description: "Accédez aux informations détaillées en toute transparence",
      features: ["Paiement sécurisé", "Tarifs flexibles", "Accès immédiat"],
      link: "/credits",
      buttonText: "Voir les offres",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: HiUserGroup,
      title: "Communauté",
      description: "Rejoignez une communauté active d'acheteurs et vendeurs",
      features: ["Avis vérifiés", "Conseils d'experts", "Support réactif"],
      link: "/community",
      buttonText: "Rejoindre",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className='py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden'>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25px 25px, #f97316 2%, transparent 0%)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-orange-500 font-medium mb-2 block"
          >
            Nos Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-6"
          >
            Solutions Complètes pour Votre Projet
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Découvrez nos services innovants pour concrétiser vos projets immobiliers
          </motion.p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl  overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              {/* Fond décoratif */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ backgroundImage: `radial-gradient(circle at 50% -20%, ${service.color}, transparent 70%)` }}
              />

              <div className='p-6 flex flex-col h-full'>
                {/* En-tête */}
                <div className="flex items-center mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center 
                    group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 ml-4 group-hover:translate-x-2 transition-transform duration-300'>
                    {service.title}
                  </h3>
                </div>

                {/* Description */}
                <p className='text-gray-600 mb-6 flex-grow'>
                  {service.description}
                </p>

                {/* Caractéristiques */}
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600 group-hover:translate-x-1 transition-transform duration-300">
                      <span className={`w-2 h-2 bg-gradient-to-br ${service.color} rounded-full mr-2`}></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Bouton */}
                <Link
                  to={service.link}
                  className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${service.color} 
                    text-white rounded-xl transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium`}
                >
                  {service.buttonText}
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
