'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapboxMapProps {
  longitude?: number;
  latitude?: number;
  address?: string;
  city?: string;
  country?: string;
  isUnlocked?: boolean;
  className?: string;
}

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';

const markerIcon = L.divIcon({
  className: 'domilix-detail-marker',
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#E8921A;border:4px solid #fff;box-shadow:0 8px 20px rgba(232,146,26,.45)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const MapboxMap: React.FC<MapboxMapProps> = ({
  longitude,
  latitude,
  address,
  city,
  country,
  isUnlocked = false,
  className = 'h-96 w-full rounded-lg',
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';
  const zone = [city, country].filter(Boolean).join(', ');

  useEffect(() => {
    if (!isUnlocked || !hasCoordinates || !GEOAPIFY_API_KEY || !mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      tap: true,
      touchZoom: true,
    }).setView([latitude, longitude], 15);

    L.tileLayer(`https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`, {
      attribution: '&copy; <a href="https://www.geoapify.com/">Geoapify</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    }).addTo(map);

    L.marker([latitude, longitude], { icon: markerIcon }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [hasCoordinates, isUnlocked, latitude, longitude]);

  if (!isUnlocked) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img src='/map_placeholder.png' alt='Localisation protégée' className='h-full w-full object-cover' />
        <div className='absolute inset-0 bg-gray-900/60' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='px-6 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20'>
              <svg className='h-8 w-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
              </svg>
            </div>
            <h3 className='mb-2 text-lg font-semibold text-white'>Localisation protégée</h3>
            <p className='mb-4 text-sm text-white/90'>Débloquez cette annonce pour voir la localisation exacte</p>
            {zone && <p className='text-sm text-white/80'>Zone approximative : {zone}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (!hasCoordinates || !GEOAPIFY_API_KEY) {
    return (
      <div className={`flex items-center justify-center bg-orange-50 text-center ${className}`}>
        <div className='px-6'>
          <h3 className='text-base font-black text-gray-950'>Localisation indisponible</h3>
          <p className='mt-2 text-sm text-gray-500'>{address || zone || 'Les coordonnées exactes ne sont pas disponibles pour cette annonce.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`domilix-detail-map relative z-0 overflow-hidden bg-gray-100 ${className}`}>
      <div ref={mapElementRef} className='h-full w-full' />
      <div className='pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm'>
        <p className='text-xs font-black uppercase tracking-wide text-[#E8921A]'>Localisation exacte</p>
        <p className='mt-1 max-w-xs text-sm font-bold text-gray-950'>{address || zone || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}</p>
      </div>
    </div>
  );
};

export default MapboxMap;
