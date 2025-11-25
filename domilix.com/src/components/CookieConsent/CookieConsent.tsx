import React, { useEffect, useState } from 'react';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookieConsent');
    
    if (!consent) {
      // Petit délai avant d'afficher pour l'animation
      setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 10);
      }, 500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onAccept?.();
    }, 300);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDecline?.();
    }, 300);
  };

  const handleCustomize = () => {
    // Ouvrir une page de paramètres des cookies
    window.location.href = '/cookie-settings';
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay avec fade-in */}
      <div
        className={`fixed inset-0 bg-black z-[9998] transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleDecline}
      />

      {/* Dialog avec slide-up et fade-in */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[9999] transform transition-all duration-500 ease-out ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white shadow-2xl border-t border-gray-200 mx-auto max-w-7xl">
          <div className="px-6 py-8 md:px-12 md:py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Contenu */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  🍪 Nous respectons votre vie privée
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Nous utilisons des cookies pour améliorer votre expérience de navigation, 
                  analyser le trafic du site et personnaliser le contenu. En cliquant sur 
                  "Tout accepter", vous consentez à notre utilisation des cookies conformément 
                  au RGPD.
                </p>
                <a
                  href="/privacy-policy"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  En savoir plus sur notre politique de confidentialité
                </a>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
                <button
                  onClick={handleCustomize}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Personnaliser
                </button>
                <button
                  onClick={handleDecline}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  Refuser
                </button>
                <button
                  onClick={handleAccept}
                  className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 shadow-lg"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
