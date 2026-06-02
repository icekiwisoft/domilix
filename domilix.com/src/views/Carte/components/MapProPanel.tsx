'use client';

export default function MapProPanel() {
  const features = [
    'Carte avancée avec heatmap',
    'Filtres avancés (surface, standing, étage)',
    'Recherche par zone libre',
    'Favoris illimités',
    'Alertes par quartier',
    'Export des résultats',
  ];

  return (
    <div className="p-4">
      <div className="bg-gradient-to-br from-brand-500 to-orange-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <h3 className="text-lg font-bold">Domilix Maps Pro</h3>
        </div>
        <p className="text-sm text-orange-100 mb-4">
          Débloquez toutes les fonctionnalités cartographiques avancées.
        </p>
        <ul className="space-y-2 mb-5">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-orange-50">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="w-full py-2.5 rounded-xl bg-white text-brand-600 font-bold text-sm hover:bg-orange-50 transition"
        >
          Passer à Maps Pro
        </button>
        <p className="text-xs text-orange-200 text-center mt-2">
          À partir de 5 000 FCFA/mois
        </p>
      </div>
    </div>
  );
}
