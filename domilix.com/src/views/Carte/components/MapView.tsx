'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { addressApi, type AddressSearchResult } from '@services/addressApi';
import { mediaUrl } from '@utils/mediaUrl';

import type { MapListing } from '../data/types';

import 'leaflet/dist/leaflet.css';

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

function getResultCoordinates(result: AddressSearchResult): [number, number] | null {
  if (typeof result.latitude === 'number' && typeof result.longitude === 'number') {
    return [result.latitude, result.longitude];
  }
  if (result.center && result.center.length === 2) {
    return [result.center[1], result.center[0]];
  }
  if (result.coordinates && result.coordinates.length === 2) {
    return [result.coordinates[1], result.coordinates[0]];
  }
  return null;
}

const QUICK_SEARCHES = [
  { label: 'Restaurants', icon: '🍴' },
  { label: 'Coffee', icon: '☕' },
  { label: 'Groceries', icon: '🛒' },
  { label: 'Things to do', icon: '📷' },
];

export default function MapView({
  listings,
  selectedListingId,
  onMarkerClick,
  onSelectListing,
  onToggleFavorite,
  isFavorite,
}: MapViewProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const initialCenterRef = useRef<[number, number] | null>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeSearching, setPlaceSearching] = useState(false);

  useEffect(() => {
    import('leaflet').then(() => setLeafletLoaded(true));
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (listings.length === 0) return [4.05, 9.76];
    const avgLat = listings.reduce((s, l) => s + l.latitude, 0) / listings.length;
    const avgLng = listings.reduce((s, l) => s + l.longitude, 0) / listings.length;
    return [avgLat, avgLng];
  }, [listings]);

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

  const handlePlaceSearch = useCallback(async (query = placeQuery) => {
    const trimmed = query.trim();
    if (!trimmed || !mapRef.current) return;

    setPlaceSearching(true);
    try {
      const localListing = listings.find((listing) => {
        const haystack = `${listing.city} ${listing.neighbourhood} ${listing.title}`.toLowerCase();
        return haystack.includes(trimmed.toLowerCase());
      });

      if (localListing) {
        mapRef.current.flyTo([localListing.latitude, localListing.longitude], 15, { duration: 0.7 });
        onMarkerClick(localListing);
        return;
      }

      const results = await addressApi.search(trimmed);
      const coordinates = results.map(getResultCoordinates).find(Boolean);
      if (coordinates) {
        mapRef.current.flyTo(coordinates, 14, { duration: 0.7 });
      }
    } finally {
      setPlaceSearching(false);
    }
  }, [listings, onMarkerClick, placeQuery]);

  useEffect(() => {
    if (!leafletLoaded || !mapElementRef.current || mapRef.current) return;
    const L = require('leaflet');
    const initialCenter = initialCenterRef.current ?? center;
    initialCenterRef.current = initialCenter;
    const map = L.map(mapElementRef.current, { zoomControl: false }).setView(initialCenter, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = require('leaflet');
    const map = mapRef.current;

    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current.clear();

    listings.forEach((listing) => {
      const icon = createPriceIcon(listing.price, selectedListingId === listing.id);
      if (!icon) return;
      const thumbnail = mediaUrl(listing.thumbnail || listing.medias?.find((media) => media.thumbnail)?.thumbnail || listing.medias?.find((media) => media.file)?.file);
      const marker = L.marker([listing.latitude, listing.longitude], { icon }).addTo(map);
      marker.on('click', () => onMarkerClick(listing));
      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:220px;max-width:240px;overflow:hidden;border-radius:14px">
          ${thumbnail ? `<img src="${thumbnail}" alt="" style="width:100%;height:110px;object-fit:cover;margin:-8px -8px 10px -8px;max-width:calc(100% + 16px)" />` : ''}
          <div style="font-size:14px;font-weight:800;margin-bottom:4px;color:#111827;line-height:1.25">${listing.title}</div>
          <div style="font-size:13px;color:#E8921A;font-weight:800;margin-bottom:4px">${listing.price.toLocaleString()} FCFA/${listing.period === 'month' ? 'mois' : 'an'}</div>
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
  }, [selectedListingId, leafletLoaded, listings]);

  if (!leafletLoaded) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="relative flex-1 h-full min-h-0">
      <div ref={mapElementRef} className="w-full h-full z-0" />

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-[1000] flex flex-col gap-2 md:left-5 md:right-auto md:top-4 md:max-w-[calc(100%-2rem)] md:flex-row md:items-center">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handlePlaceSearch();
          }}
          className="pointer-events-auto flex h-11 w-full items-center rounded-full border border-gray-200 bg-white px-4 shadow-[0_2px_8px_rgba(15,23,42,0.20)] md:w-[360px]"
        >
          <svg className="mr-2 h-5 w-5 shrink-0 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={placeQuery}
            onChange={(event) => setPlaceQuery(event.target.value)}
            placeholder="Rechercher un lieu..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-500"
          />
          {placeSearching && <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#E8921A]" />}
        </form>

        <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {QUICK_SEARCHES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setPlaceQuery(item.label);
                handlePlaceSearch(item.label);
              }}
              className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-800 shadow-[0_2px_8px_rgba(15,23,42,0.18)] transition hover:bg-gray-50"
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

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
