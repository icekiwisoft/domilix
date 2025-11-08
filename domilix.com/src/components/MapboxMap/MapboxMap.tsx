import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
  longitude?: number;
  latitude?: number;
  address?: string;
  city?: string;
  country?: string;
  isUnlocked?: boolean;
  className?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  longitude,
  latitude,
  address,
  city,
  country,
  isUnlocked = false,
  className = 'h-96 w-full rounded-lg',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Default coordinates (Paris if no location provided)
    const defaultLng = 2.3522;
    const defaultLat = 48.8566;

    // Use provided coordinates if unlocked, otherwise use default
    const mapLng = isUnlocked && longitude ? longitude : defaultLng;
    const mapLat = isUnlocked && latitude ? latitude : defaultLat;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapLng, mapLat],
      zoom: isUnlocked ? 15 : 10,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker if coordinates are available and unlocked
    if (isUnlocked && longitude && latitude) {
      marker.current = new mapboxgl.Marker({
        color: '#f97316', // Orange color
      })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-semibold text-gray-900">${address || 'Localisation'}</h3>
              <p class="text-sm text-gray-600">${city || ''}, ${country || ''}</p>
            </div>`
          )
        )
        .addTo(map.current);
    }

    // Cleanup function
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [longitude, latitude, address, city, country, isUnlocked]);

  return (
    <div className='relative'>
      <div ref={mapContainer} className={className} />

      {/* Overlay for locked state */}
      {!isUnlocked && (
        <div className='absolute inset-0 bg-gray-900/60 flex items-center justify-center rounded-lg'>
          <div className='text-center px-6'>
            <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-white'
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
            </div>
            <h3 className='text-white font-semibold text-lg mb-2'>
              Localisation protégée
            </h3>
            <p className='text-white/90 text-sm mb-4'>
              Débloquez cette annonce pour voir la localisation exacte
            </p>
            <div className='text-white/80 text-sm'>
              Zone approximative: {city || 'Ville'}, {country || 'Pays'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
