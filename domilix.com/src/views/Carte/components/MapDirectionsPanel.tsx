'use client';

import { useMemo } from 'react';
import { DirectionPoint } from '../data/types';

interface MapDirectionsPanelProps {
  directionFrom: DirectionPoint | null;
  directionTo: DirectionPoint | null;
  onClearFrom: () => void;
  onClearTo: () => void;
  onClear: () => void;
}

function haversineDistance(from: DirectionPoint, to: DirectionPoint): number {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapDirectionsPanel({
  directionFrom,
  directionTo,
  onClearFrom,
  onClearTo,
  onClear,
}: MapDirectionsPanelProps) {
  const distance = useMemo(() => {
    if (!directionFrom || !directionTo) return null;
    const km = haversineDistance(directionFrom, directionTo);
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  }, [directionFrom, directionTo]);

  return (
    <div className="space-y-4 px-3 pb-4">
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Départ</p>
          {directionFrom ? (
            <div className="mt-1.5 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">
                  {directionFrom.label || `${directionFrom.lat.toFixed(4)}, ${directionFrom.lng.toFixed(4)}`}
                </p>
                <p className="text-xs text-gray-500">
                  {directionFrom.lat.toFixed(6)}, {directionFrom.lng.toFixed(6)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClearFrom}
                className="ml-2 shrink-0 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-[#E8921A] shadow-sm transition hover:bg-orange-50"
              >
                Changer
              </button>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-400">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Faites un clic droit sur la carte</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-400">
            ↓
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Arrivée</p>
          {directionTo ? (
            <div className="mt-1.5 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">
                  {directionTo.label || `${directionTo.lat.toFixed(4)}, ${directionTo.lng.toFixed(4)}`}
                </p>
                <p className="text-xs text-gray-500">
                  {directionTo.lat.toFixed(6)}, {directionTo.lng.toFixed(6)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClearTo}
                className="ml-2 shrink-0 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-[#E8921A] shadow-sm transition hover:bg-orange-50"
              >
                Changer
              </button>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-400">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Faites un clic droit sur la carte</span>
            </div>
          )}
        </div>
      </div>

      {directionFrom && directionTo && (
        <>
          <div className="rounded-2xl bg-gradient-to-r from-[#E8921A]/10 to-orange-100/40 p-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#E8921A]">Distance à vol d'oiseau</p>
            <p className="mt-1 text-2xl font-black text-gray-950">{distance}</p>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Effacer l'itinéraire
          </button>
        </>
      )}
    </div>
  );
}
