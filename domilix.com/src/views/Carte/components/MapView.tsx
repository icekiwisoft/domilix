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

function getPropertyLabel(listing: MapListing): string {
  if (listing.item_type) return listing.item_type;
  if (listing.ad_type === 'sale') return 'Vente';
  return 'Location';
}

function createListingIcon(listing: MapListing, isSelected: boolean, liked: boolean): any {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  const propertyLabel = getPropertyLabel(listing);

  return L.divIcon({
    className: '',
    html: `
      <div style="
        position:relative;
        transform:translate(-50%, -104%);
        font-family:Manrope, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        filter:drop-shadow(0 10px 18px rgba(15,23,42,0.22));
      ">
        <div style="
          position:relative;
          display:flex;
          align-items:center;
          gap:7px;
          min-width:${isSelected ? '112px' : '92px'};
          padding:${isSelected ? '7px 10px' : '6px 9px'};
          border-radius:16px;
          border:2px solid ${isSelected ? '#E8921A' : 'rgba(255,255,255,0.95)'};
          background:${isSelected ? 'linear-gradient(135deg,#E8921A,#f97316)' : 'rgba(255,255,255,0.96)'};
          color:${isSelected ? '#fff' : '#111827'};
          box-shadow:${isSelected ? '0 14px 28px rgba(232,146,26,0.35)' : '0 8px 22px rgba(15,23,42,0.16)'};
          white-space:nowrap;
          backdrop-filter:blur(12px);
        ">
          <div style="
            display:flex;
            height:28px;
            width:28px;
            align-items:center;
            justify-content:center;
            border-radius:10px;
            background:${isSelected ? 'rgba(255,255,255,0.18)' : '#fff7ed'};
            color:${isSelected ? '#fff' : '#E8921A'};
            font-size:14px;
          ">⌂</div>
          <div style="line-height:1.05">
            <div style="font-size:${isSelected ? '14px' : '13px'};font-weight:900;letter-spacing:-0.02em">${formatPrice(listing.price)}</div>
            <div style="margin-top:2px;max-width:78px;overflow:hidden;text-overflow:ellipsis;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;opacity:${isSelected ? '0.82' : '0.48'}">${propertyLabel}</div>
          </div>
          ${liked ? `<div style="position:absolute;right:-5px;top:-5px;display:flex;height:18px;width:18px;align-items:center;justify-content:center;border-radius:999px;background:#E8921A;color:white;border:2px solid white;font-size:10px">♥</div>` : ''}
        </div>
        <div style="
          position:absolute;
          left:50%;
          bottom:-7px;
          height:14px;
          width:14px;
          transform:translateX(-50%) rotate(45deg);
          border-right:2px solid ${isSelected ? '#E8921A' : 'rgba(255,255,255,0.95)'};
          border-bottom:2px solid ${isSelected ? '#E8921A' : 'rgba(255,255,255,0.95)'};
          background:${isSelected ? '#f97316' : 'rgba(255,255,255,0.96)'};
        "></div>
      </div>
    `,
    iconSize: [120, 58],
    iconAnchor: [60, 58],
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
      const isSelected = selectedListingId === listing.id;
      const liked = isFavorite(listing.id);
      const icon = createListingIcon(listing, isSelected, liked);
      if (!icon) return;
      const thumbnail = mediaUrl(listing.thumbnail || listing.medias?.find((media) => media.thumbnail)?.thumbnail || listing.medias?.find((media) => media.file)?.file);
      const marker = L.marker([listing.latitude, listing.longitude], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(map);
      marker.on('click', () => onMarkerClick(listing));
      marker.bindPopup(`
        <div style="font-family:Manrope,system-ui,sans-serif;width:250px;overflow:hidden;border-radius:18px;background:#fff">
          <div style="position:relative;height:128px;background:linear-gradient(135deg,#fff7ed,#f3f4f6);overflow:hidden">
            ${thumbnail ? `<img src="${thumbnail}" alt="" style="width:100%;height:100%;object-fit:cover" />` : `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#fed7aa;font-size:42px">⌂</div>`}
            <div style="position:absolute;inset:auto 0 0 0;height:58px;background:linear-gradient(to top,rgba(0,0,0,.55),transparent)"></div>
            <div style="position:absolute;left:10px;bottom:9px;border-radius:999px;background:#E8921A;color:white;padding:5px 9px;font-size:12px;font-weight:900;box-shadow:0 8px 18px rgba(232,146,26,.35)">${listing.price.toLocaleString()} FCFA</div>
            ${liked ? `<div style="position:absolute;right:10px;top:10px;border-radius:999px;background:white;color:#E8921A;height:28px;width:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 8px 18px rgba(0,0,0,.18)">♥</div>` : ''}
          </div>
          <div style="padding:12px 12px 13px">
            <div style="font-size:14px;font-weight:900;margin-bottom:5px;color:#111827;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${listing.title}</div>
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:9px;color:#6b7280;font-size:12px;font-weight:650">
              <span style="color:#E8921A">●</span>
              <span>${listing.neighbourhood || listing.city}${listing.neighbourhood && listing.city ? `, ${listing.city}` : ''}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <span style="border:1px solid #fed7aa;background:#fff7ed;color:#c2410c;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.04em">${getPropertyLabel(listing)}</span>
              ${listing.bedrooms ? `<span style="border:1px solid #e5e7eb;background:#fff;color:#4b5563;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:800">${listing.bedrooms} ch</span>` : ''}
              ${listing.bathrooms ? `<span style="border:1px solid #e5e7eb;background:#fff;color:#4b5563;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:800">${listing.bathrooms} sdb</span>` : ''}
              ${listing.is_verified ? `<span style="border:1px solid #bbf7d0;background:#f0fdf4;color:#15803d;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:900">Verifie</span>` : ''}
            </div>
          </div>
        </div>
      `);
      markersRef.current.set(listing.id, marker);
    });

    return () => {
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current.clear();
    };
  }, [listings, selectedListingId, leafletLoaded, onMarkerClick, isFavorite]);

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
