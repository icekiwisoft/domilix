'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { MapListing } from '../data/types';

import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false },
);

interface MapViewProps {
  listings: MapListing[];
  selectedListingId: number | null;
  onMarkerClick: (listing: MapListing) => void;
  onSelectListing: (id: number) => void;
  onToggleFavorite: (listing: MapListing) => void;
  isFavorite: (id: number) => boolean;
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)}k`;
  return price.toString();
}

function createPriceIcon(price: number, isSelected: boolean): any {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  return L.divIcon({
    className: '',
    html: `<div style="
      background: ${isSelected ? '#f97316' : '#ffffff'};
      color: ${isSelected ? '#ffffff' : '#1f2937'};
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      border: 2px solid ${isSelected ? '#f97316' : '#ffffff'};
      transform: translate(-50%, -100%);
      font-family: system-ui, -apple-system, sans-serif;
    ">${formatPrice(price)}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function MapView({
  listings,
  selectedListingId,
  onMarkerClick,
  onSelectListing,
  onToggleFavorite,
  isFavorite,
}: MapViewProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    import('leaflet').then(() => setLeafletLoaded(true));
  }, []);

  const center: [number, number] = (() => {
    if (listings.length === 0) return [4.05, 9.76];
    const avgLat = listings.reduce((s, l) => s + l.latitude, 0) / listings.length;
    const avgLng = listings.reduce((s, l) => s + l.longitude, 0) / listings.length;
    return [avgLat, avgLng];
  })();

  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(center, 12, { duration: 0.8 });
    }
  }, [center]);

  const handleLocate = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mapRef.current) {
            mapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 0.8 });
          }
        },
        () => {},
      );
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = require('leaflet');
    const map = mapRef.current;

    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current.clear();

    listings.forEach((listing) => {
      const icon = createPriceIcon(listing.price, selectedListingId === listing.id);
      if (!icon) return;
      const marker = L.marker([listing.latitude, listing.longitude], { icon }).addTo(map);
      marker.on('click', () => onMarkerClick(listing));
      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:200px">
          <div style="font-size:14px;font-weight:700;margin-bottom:4px">${listing.title}</div>
          <div style="font-size:13px;color:#f97316;font-weight:600;margin-bottom:4px">${listing.price.toLocaleString()} FCFA/${listing.period === 'month' ? 'mois' : 'an'}</div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px">${listing.neighbourhood}, ${listing.city}</div>
          <div style="font-size:12px;color:#6b7280">${listing.item_type} · ${listing.bedrooms} ch · ${listing.bathrooms} sdb</div>
        </div>
      `);
      markersRef.current.set(listing.id, marker);
    });

    return () => {
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current.clear();
    };
  }, [listings, selectedListingId, leafletLoaded, onMarkerClick]);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    if (selectedListingId) {
      const listing = listings.find((l) => l.id === selectedListingId);
      if (listing) {
        mapRef.current.flyTo([listing.latitude, listing.longitude], 15, { duration: 0.6 });
      }
    }
  }, [selectedListingId, leafletLoaded]);

  if (!leafletLoaded) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="relative flex-1 h-full min-h-0">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={12}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      <button
        type="button"
        onClick={handleLocate}
        className="absolute bottom-24 md:bottom-6 right-4 z-[1000] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
        title="Ma position"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleRecenter}
        className="absolute bottom-36 md:bottom-16 right-4 z-[1000] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
        title="Recentrer"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>
  );
}
