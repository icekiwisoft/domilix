import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

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
    // Ne charge Mapbox que si l'annonce est débloquée
    if (!isUnlocked || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude ?? 2.3522, latitude ?? 48.8566],
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    if (longitude && latitude) {
      marker.current = new mapboxgl.Marker({ color: '#f97316' })
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

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [longitude, latitude, address, city, country, isUnlocked]);

  // ── Annonce non débloquée : placeholder statique, Mapbox ne charge pas ──
  if (!isUnlocked) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src='/map_placeholder.png'
          alt='Localisation protégée'
          className='h-full w-full object-cover'
        />
        {/* Dark overlay */}
        <div className='absolute inset-0 bg-gray-900/60' />
        {/* Lock content */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center px-6'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20'>
              <svg className='h-8 w-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
              </svg>
            </div>
            <h3 className='text-white font-semibold text-lg mb-2'>Localisation protégée</h3>
            <p className='text-white/90 text-sm mb-4'>
              Débloquez cette annonce pour voir la localisation exacte
            </p>
            {(city || country) && (
              <p className='text-white/80 text-sm'>
                Zone approximative: {[city, country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Annonce débloquée : carte Mapbox réelle ──
  return (
    <div className='relative'>
      <div ref={mapContainer} className={className} />
    </div>
  );
};

export default MapboxMap;

