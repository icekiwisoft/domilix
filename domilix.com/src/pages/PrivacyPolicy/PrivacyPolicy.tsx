import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Politique de confidentialité
        </h1>

        <div className="prose prose-indigo max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD), 
              nous nous engageons à protéger et respecter votre vie privée. Cette politique 
              explique comment nous collectons, utilisons et protégeons vos données personnelles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Données collectées
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Nous collectons les types de données suivants :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Informations d'identification (nom, email, téléphone)</li>
              <li>Données de navigation (cookies, adresse IP)</li>
              <li>Préférences utilisateur</li>
              <li>Historique des interactions avec le site</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Utilisation des cookies
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Nous utilisons différents types de cookies :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Cookies nécessaires :</strong> Essentiels au fonctionnement du site</li>
              <li><strong>Cookies analytiques :</strong> Pour comprendre l'utilisation du site</li>
              <li><strong>Cookies marketing :</strong> Pour personnaliser les publicités</li>
              <li><strong>Cookies de préférences :</strong> Pour mémoriser vos choix</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Vous pouvez gérer vos préférences de cookies à tout moment via notre{' '}
              <Link to="/cookie-settings" className="text-indigo-600 hover:text-indigo-800 underline">
                page de paramètres
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Vos droits
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification de vos données</li>
              <li>Droit à l'effacement (droit à l'oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Sécurité des données
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
              appropriées pour protéger vos données contre tout accès non autorisé, perte ou 
              destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Contact
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou pour exercer 
              vos droits, vous pouvez nous contacter via notre{' '}
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-800 underline">
                page de contact
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Modifications
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout 
              moment. Les modifications seront publiées sur cette page avec une date de mise à jour.
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </section>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
