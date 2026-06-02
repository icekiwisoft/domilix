'use client';

import { MapFiltersState } from '../data/types';

interface MapFiltersProps {
  filters: MapFiltersState;
  onFiltersChange: (filters: MapFiltersState) => void;
  cities: string[];
}

const ITEM_TYPES = ['', 'Chambre', 'Appartement', 'Maison', 'Meublé'];
const AD_TYPES = ['', 'location', 'sale'];

export default function MapFilters({ filters, onFiltersChange, cities }: MapFiltersProps) {
  const update = (key: keyof MapFiltersState, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({
      city: '',
      item_type: '',
      price_min: '',
      price_max: '',
      ad_type: '',
      verified_only: false,
    });
  };

  const hasActiveFilters =
    filters.city ||
    filters.item_type ||
    filters.price_min ||
    filters.price_max ||
    filters.ad_type ||
    filters.verified_only;

  return (
    <div className="p-3 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filtres</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-brand-500 font-semibold hover:text-brand-600"
          >
            Tout effacer
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ville</label>
        <select
          value={filters.city}
          onChange={(e) => update('city', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
        >
          <option value="">Toutes les villes</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type de bien</label>
        <div className="flex flex-wrap gap-2">
          {ITEM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update('item_type', type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filters.item_type === type
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type || 'Tous'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Transaction</label>
        <div className="flex gap-2">
          {AD_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update('ad_type', type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filters.ad_type === type
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === '' ? 'Tous' : type === 'location' ? 'Location' : 'Vente'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prix (FCFA)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.price_min}
            onChange={(e) => update('price_min', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
          />
          <span className="text-gray-400 text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.price_max}
            onChange={(e) => update('price_max', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.verified_only}
          onChange={(e) => update('verified_only', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-300"
        />
        <span className="text-sm text-gray-700">Annonceurs vérifiés uniquement</span>
      </label>
    </div>
  );
}
