import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiHomeModern, HiEnvelope } from 'react-icons/hi2';
import { FaGithub, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import path from 'path';


const urls = [
  {
    name: "Home",
    path: "/"
  },
  {
    name: "About",
    path: "/about"
  },
  {
    name: "Contact",
    path: "/contact"
  }
]
export default function Footer(): React.ReactElement {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'inscription newsletter
  };

  return (
    <footer className='bg-gray-900 text-white relative'>
      {/* Vague décorative */}
      <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
        <svg viewBox="0 0 2880 48" className="absolute bottom-0 w-full text-gray-900">
          <path
            d="M0 48h2880V0h-720C1442.5 52 720 0 720 0H0v48z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8'>
        {/* Section Newsletter */}
        <div className='mb-16'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className='max-w-xl mx-auto text-center'
          >
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiEnvelope className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className='text-2xl font-bold mb-4'>Restez connecté</h3>
            <p className='text-gray-400 mb-8'>
              Inscrivez-vous à notre newsletter pour recevoir les dernières offres immobilières
            </p>
            <form onSubmit={handleNewsletterSubmit} className='relative'>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl 
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 
                  transition-all duration-200 outline-none text-white pr-36
                  placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-6 py-2 bg-orange-500 text-white rounded-lg 
                  hover:bg-orange-600 transition-colors duration-200 font-medium"
              >
                S'inscrire
              </button>
            </form>
          </motion.div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12'>
          {/* Logo et Description */}
          <div className='space-y-4'>
            <Link to="/" className='flex items-center space-x-2 group'>
              <HiHomeModern className='h-8 w-8 text-orange-500 group-hover:scale-110 transition-transform duration-200' />
              <span className='text-2xl font-bold group-hover:text-orange-500 transition-colors duration-200'>Domilix</span>
            </Link>
            <p className='text-gray-400 pr-4'>
              Votre partenaire de confiance pour trouver votre maison idéale en toute sécurité.
            </p>
          </div>

          {/* Liens Rapides */}
          <div>
            <h3 className='text-lg font-semibold mb-6 relative'>
              Liens Rapides
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <ul className='space-y-3'>
              {urls.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className='text-gray-400 hover:text-orange-500 transition-colors duration-200 flex items-center space-x-2'
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 transition-opacity duration-200"></span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-lg font-semibold mb-6 relative'>
              Contact
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <ul className='space-y-4 text-gray-400'>
              <li className='flex items-start space-x-3'>
                <span className="w-5 h-5 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                </span>
                <span>Simbok Etok-koss (Yaoundé)</span>
              </li>
              <li className='flex items-center space-x-3'>
                <span className="w-5 h-5 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                </span>
                <a href='mailto:contact@domilix.com' className='hover:text-orange-500 transition-colors duration-200'>
                  contact@domilix.com
                </a>
              </li>
              <li className='flex items-center space-x-3'>
                <span className="w-5 h-5 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                </span>
                <a href='tel:+237698555511' className='hover:text-orange-500 transition-colors duration-200'>
                  +237 698 555 511
                </a>
              </li>
            </ul>
          </div>

          {/* Réseaux Sociaux */}
          <div>
            <h3 className='text-lg font-semibold mb-6 relative'>
              Suivez-nous
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <div className='flex space-x-4'>
              {[
                { icon: FaTwitter, link: '#' },
                { icon: FaLinkedinIn, link: '#' },
                { icon: FaInstagram, link: '#' },
                { icon: FaGithub, link: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center 
                    text-gray-400 hover:bg-orange-500 hover:text-white transform hover:-translate-y-1 
                    transition-all duration-200'
                >
                  <social.icon className='w-5 h-5' />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className='border-t border-gray-800 mt-12 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-400 text-sm'>
              © {new Date().getFullYear()} Domilix. Tous droits réservés.
            </p>
            <div className='flex space-x-6 mt-4 md:mt-0'>
              <Link to="/privacy" className='text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200'>
                Politique de confidentialité
              </Link>
              <Link to="/terms" className='text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200'>
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
