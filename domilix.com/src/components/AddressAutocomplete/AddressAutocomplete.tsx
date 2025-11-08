import React, { useState, useEffect, useRef } from 'react';
import {
  searchPlaces,
  MapboxFeature,
  parseAddressComponents,
} from '@services/mapboxApi';
import { MdLocationOn, MdMyLocation } from 'react-icons/md';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onLocationSelect: (location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Rechercher une adresse...',
  className = '',
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce pour éviter trop de requêtes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.length >= 3) {
        handleSearch(value);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        error => {
          console.log('Géolocalisation non disponible:', error);
        }
      );
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!query || query.length < 3) return;

    setIsLoading(true);
    try {
      const results = await searchPlaces(query, userLocation || undefined);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (feature: MapboxFeature) => {
    const addressComponents = parseAddressComponents(feature);

    onChange(feature.place_name);
    onLocationSelect({
      coordinates: feature.center,
      address: addressComponents.address,
      city: addressComponents.city,
      state: addressComponents.state,
      country: addressComponents.country,
      zip: addressComponents.zip,
    });

    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);

          // Faire un géocodage inverse pour obtenir l'adresse
          try {
            const { reverseGeocode } = await import('@services/mapboxApi');
            const result = await reverseGeocode(longitude, latitude);

            if (result) {
              const addressComponents = parseAddressComponents(result);
              onChange(result.place_name);
              onLocationSelect({
                coordinates: [longitude, latitude],
                address: addressComponents.address,
                city: addressComponents.city,
                state: addressComponents.state,
                country: addressComponents.country,
                zip: addressComponents.zip,
              });
            }
          } catch (error) {
            console.error('Erreur de géocodage inverse:', error);
          }
        },
        error => {
          console.error('Erreur de géolocalisation:', error);
          alert(
            "Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation."
          );
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  return (
    <div ref={containerRef} className='relative'>
      <div className='relative'>
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={
            className ||
            `w-full px-3 py-2 pr-20 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm`
          }
        />

        {/* Icône de recherche et géolocalisation - seulement si pas de classe personnalisée */}
        {!className && (
          <>
            {/* Icône de recherche */}
            <div className='absolute inset-y-0 right-12 flex items-center pointer-events-none'>
              <MdLocationOn className='w-5 h-5 text-gray-400' />
            </div>

            {/* Bouton de géolocalisation */}
            <button
              type='button'
              onClick={getCurrentLocation}
              className='absolute inset-y-0 right-2 flex items-center px-2 text-gray-400 hover:text-orange-500 transition-colors duration-200'
              title='Utiliser ma position'
            >
              <MdMyLocation className='w-5 h-5' />
            </button>
          </>
        )}

        {/* Indicateur de chargement */}
        {isLoading && !className && (
          <div className='absolute inset-y-0 right-20 flex items-center'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500'></div>
          </div>
        )}

        {/* Indicateur de chargement pour style personnalisé */}
        {isLoading && className && (
          <div className='absolute inset-y-0 right-2 flex items-center'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500'></div>
          </div>
        )}
      </div>

      {/* Liste des suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className='absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type='button'
              onClick={() => handleSuggestionClick(suggestion)}
              className='w-full px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors duration-150'
            >
              <div className='flex items-start space-x-3'>
                <MdLocationOn className='w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-900 truncate'>
                    {suggestion.text}
                  </div>
                  <div className='text-xs text-gray-500 truncate'>
                    {suggestion.place_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
