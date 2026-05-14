'use client';

import { addressApi, ReverseGeocodeResult } from '@services/addressApi';
import { updateAd } from '@services/announceApi';
import { Ad } from '@utils/types';
import { FormEvent, useEffect, useState } from 'react';
import { MapPinIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MdMyLocation } from 'react-icons/md';

interface EditAdModalProps {
  ad: Ad;
  onClose: () => void;
  onUpdated?: (ad: Ad) => void;
}

const boolToString = (value: unknown) => (value ? '1' : '0');

export default function EditAdModal({ ad, onClose, onUpdated }: EditAdModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [detectedLocation, setDetectedLocation] = useState<ReverseGeocodeResult | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [longitudeInput, setLongitudeInput] = useState(ad.longitude ? String(ad.longitude) : '');
  const [latitudeInput, setLatitudeInput] = useState(ad.latitude ? String(ad.latitude) : '');
  const [useManualCoordinates, setUseManualCoordinates] = useState(!!ad.longitude && !!ad.latitude);
  const [formData, setFormData] = useState({
    description: ad.description || '',
    price: ad.price ? String(ad.price) : '',
    address: ad.address || '',
    city: ad.city || '',
    state: ad.state || '',
    country: ad.country || '',
    zip: ad.zip || ad.postal_code || '',
    period: ad.period || '',
    devise: ad.devise || 'XAF',
    bedroom: ad.bedroom ? String(ad.bedroom) : '',
    mainroom: ad.mainroom ? String(ad.mainroom) : '',
    toilet: ad.toilet ? String(ad.toilet) : '',
    kitchen: ad.kitchen ? String(ad.kitchen) : '',
    caution: ad.caution ? String(ad.caution) : '',
    gate: boolToString(ad.gate),
    wifi: boolToString(ad.wifi),
    air_conditioning: boolToString(ad.air_conditioning),
    security_24h: boolToString(ad.security_24h),
    smart_tv: boolToString(ad.smart_tv),
    equipped_kitchen: boolToString(ad.equipped_kitchen),
    pool: boolToString(ad.pool),
    garage: boolToString(ad.garage),
    furnitured: boolToString(ad.furnitured),
    garden: boolToString(ad.garden),
    height: ad.height ? String(ad.height) : '',
    width: ad.width ? String(ad.width) : '',
    length: ad.length ? String(ad.length) : '',
    weight: ad.weight ? String(ad.weight) : '',
    localization: [ad.longitude || 0, ad.latitude || 0] as [number, number],
  });
  const isRealestate = ad.type === 'realestate';

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }

    setIsGettingCurrentLocation(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setFormData(current => ({ ...current, localization: [longitude, latitude] }));
        setLongitudeInput(String(longitude));
        setLatitudeInput(String(latitude));
        setUseManualCoordinates(true);
        setIsGettingCurrentLocation(false);
      },
      () => {
        setLocationError("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.");
        setIsGettingCurrentLocation(false);
      },
    );
  };

  const handleLocalizationChange = (value: string, index: number) => {
    const normalizedValue = value.replace(',', '.');
    const numericValue = normalizedValue === '' ? 0 : Number(normalizedValue);
    if (index === 0) setLongitudeInput(value);
    else setLatitudeInput(value);
    if (normalizedValue !== '' && Number.isNaN(numericValue)) return;

    setLocationError('');
    setFormData(current => ({
      ...current,
      localization: index === 0
        ? [numericValue, current.localization[1]]
        : [current.localization[0], numericValue],
    }));
  };

  useEffect(() => {
    const [longitude, latitude] = formData.localization;
    if (!longitude || !latitude) {
      setDetectedLocation(null);
      return;
    }
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      setDetectedLocation(null);
      setLocationError('Coordonnées GPS invalides.');
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setIsDetectingLocation(true);
        const result = await addressApi.reverseGeocode(longitude, latitude);
        setDetectedLocation(result);
        setLocationError(result ? '' : "Impossible de détecter l'adresse pour ces coordonnées.");
      } catch {
        setDetectedLocation(null);
        setLocationError("Impossible de détecter l'adresse pour ces coordonnées.");
      } finally {
        setIsDetectingLocation(false);
      }
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [formData.localization]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      const updated = await updateAd(ad.id, {
        description: formData.description,
        price: Number(formData.price),
        period: formData.period,
        devise: formData.devise,
        localization: formData.localization.map(value => String(value)),
        ...(isRealestate
          ? {
              bedroom: Number(formData.bedroom || 0),
              mainroom: Number(formData.mainroom || 0),
              toilet: Number(formData.toilet || 0),
              kitchen: Number(formData.kitchen || 0),
              caution: formData.caution ? Number(formData.caution) : null,
              gate: formData.gate,
              wifi: formData.wifi,
              air_conditioning: formData.air_conditioning,
              security_24h: formData.security_24h,
              smart_tv: formData.smart_tv,
              equipped_kitchen: formData.equipped_kitchen,
              pool: formData.pool,
              garage: formData.garage,
              furnitured: formData.furnitured,
              garden: formData.garden,
            }
          : {
              height: formData.height ? Number(formData.height) : null,
              width: formData.width ? Number(formData.width) : null,
              length: formData.length ? Number(formData.length) : null,
              weight: formData.weight ? Number(formData.weight) : null,
            }),
      });
      onUpdated?.(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-md'>
      <form onSubmit={handleSubmit} className='relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/30'>
        <div className='absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-orange-400 to-amber-300' />
        <div className='flex items-center justify-between border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 px-6 py-5'>
          <div className='flex items-center gap-4'>
            <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-orange-500/20'>
              <SparklesIcon className='h-6 w-6' />
            </span>
            <div>
              <p className='text-xs font-black uppercase tracking-[0.22em] text-primary'>Domilix Studio</p>
              <h3 className='text-2xl font-black tracking-tight text-gray-950'>Modifier l'annonce</h3>
              <p className='text-sm text-gray-500'>Mettez vos informations à jour comme lors de la publication.</p>
            </div>
          </div>
          <button type='button' onClick={onClose} className='rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700' aria-label='Fermer'>
            <XMarkIcon className='h-5 w-5' />
          </button>
        </div>

        <div className='max-h-[72vh] space-y-5 overflow-y-auto px-6 py-6'>
          <section className='rounded-[1.5rem] border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/60'>
            <h4 className='mb-4 text-sm font-black uppercase tracking-[0.16em] text-primary'>Essentiel</h4>
            <Field label='Description' textarea value={formData.description} onChange={value => setFormData(current => ({ ...current, description: value }))} />
          </section>

          <section className='rounded-[1.5rem] border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/60'>
            <h4 className='mb-4 text-sm font-black uppercase tracking-[0.16em] text-primary'>Prix et disponibilité</h4>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <Field label='Prix' type='number' value={formData.price} onChange={value => setFormData(current => ({ ...current, price: value }))} />
            <Select label='Devise' value={formData.devise} onChange={value => setFormData(current => ({ ...current, devise: value }))} options={[['XAF', 'FCFA'], ['EUR', 'EUR'], ['USD', 'USD']]} />
            <Select label='Période' value={formData.period} onChange={value => setFormData(current => ({ ...current, period: value }))} options={[['', 'Non précisée'], ['hour', 'Heure'], ['day', 'Jour'], ['night', 'Nuit'], ['month', 'Mois'], ['year', 'Année']]} />
            </div>
          </section>

          <section className='rounded-[1.5rem] border border-orange-100 bg-orange-50/35 p-4 shadow-sm shadow-orange-100/60'>
            <div className='mb-4 flex items-center gap-2'>
              <MapPinIcon className='h-5 w-5 text-primary' />
              <h4 className='text-sm font-black uppercase tracking-[0.16em] text-primary'>Localisation</h4>
            </div>
            <div className='rounded-xl border border-gray-200 bg-gray-50 p-4'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h5 className='text-sm font-semibold text-gray-800'>Position exacte du bien</h5>
                  <p className='mt-1 text-xs text-gray-500'>
                    Utilisez votre position actuelle ou entrez longitude puis latitude. Domilix remplira l'adresse automatiquement.
                  </p>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={getCurrentLocation}
                    disabled={isGettingCurrentLocation}
                    className='inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400'
                  >
                    <MdMyLocation className={`h-4 w-4 ${isGettingCurrentLocation ? 'animate-pulse' : ''}`} />
                    {isGettingCurrentLocation ? 'Récupération...' : 'Position actuelle'}
                  </button>
                  <button
                    type='button'
                    onClick={() => setUseManualCoordinates(value => !value)}
                    className='rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-50'
                  >
                    {useManualCoordinates ? 'Masquer' : 'Saisie manuelle'}
                  </button>
                </div>
              </div>

              {(useManualCoordinates || (formData.localization[0] !== 0 && formData.localization[1] !== 0)) && (
                <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <Field label='Longitude' value={longitudeInput || (formData.localization[0] ? String(formData.localization[0]) : '')} onChange={value => handleLocalizationChange(value, 0)} />
                  <Field label='Latitude' value={latitudeInput || (formData.localization[1] ? String(formData.localization[1]) : '')} onChange={value => handleLocalizationChange(value, 1)} />
                </div>
              )}
            </div>

            <div className='mt-4 rounded-lg border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-orange-800'>
              Après enregistrement, le backend utilisera ces coordonnées pour détecter automatiquement l'adresse, la ville, la région et le pays.
            </div>
            {(isDetectingLocation || detectedLocation) && (
              <div className='mt-4 rounded-lg border border-gray-200 bg-white p-4'>
                <h5 className='text-sm font-semibold text-gray-800'>Lieu détecté</h5>
                {isDetectingLocation ? (
                  <p className='mt-2 text-sm text-gray-500'>Détection en cours...</p>
                ) : detectedLocation && (
                  <div className='mt-2 space-y-1 text-sm text-gray-700'>
                    {detectedLocation.address && <p><strong>Adresse :</strong> {detectedLocation.address}</p>}
                    {detectedLocation.neighborhood && <p><strong>Quartier :</strong> {detectedLocation.neighborhood}</p>}
                    {detectedLocation.city && <p><strong>Ville :</strong> {detectedLocation.city}</p>}
                    {detectedLocation.state && <p><strong>Région :</strong> {detectedLocation.state}</p>}
                    {detectedLocation.country && <p><strong>Pays :</strong> {detectedLocation.country}</p>}
                    {detectedLocation.zip && <p><strong>Code postal :</strong> {detectedLocation.zip}</p>}
                  </div>
                )}
              </div>
            )}
            {locationError && <p className='mt-3 text-sm font-semibold text-red-600'>{locationError}</p>}
          </section>

          {isRealestate ? (
            <section className='space-y-4 rounded-[1.5rem] border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/60'>
              <h4 className='text-sm font-black uppercase tracking-[0.16em] text-primary'>Caractéristiques immobilier</h4>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-5'>
                {(['bedroom', 'mainroom', 'toilet', 'kitchen', 'caution'] as const).map((key, index) => (
                  <Field key={key} label={['Chambres', 'Salons', 'Toilettes', 'Cuisines', 'Caution'][index]} type='number' value={formData[key]} onChange={value => setFormData(current => ({ ...current, [key]: value }))} />
                ))}
              </div>
              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                {[
                  ['wifi', 'WiFi inclus'], ['air_conditioning', 'Climatisation'], ['security_24h', 'Sécurité 24h/24'], ['equipped_kitchen', 'Cuisine équipée'], ['smart_tv', 'Smart TV'], ['gate', 'Portail sécurisé'], ['pool', 'Piscine'], ['garage', 'Garage'], ['furnitured', 'Meublé'], ['garden', 'Jardin'],
                ].map(([key, label]) => (
                  <label key={key} className='group flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-100 transition hover:ring-orange-200'>
                    <input type='checkbox' checked={formData[key as keyof typeof formData] === '1'} onChange={event => setFormData(current => ({ ...current, [key]: event.target.checked ? '1' : '0' }))} className='peer sr-only' />
                    <span className='flex h-5 w-5 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition-all peer-checked:border-orange-500 peer-checked:bg-orange-500 peer-focus-visible:ring-4 peer-focus-visible:ring-orange-100 group-hover:border-orange-300'>
                      <svg className='h-3.5 w-3.5 scale-0 text-white transition-transform peer-checked:scale-100' viewBox='0 0 20 20' fill='none' aria-hidden='true'>
                        <path d='M5 10.5 8.2 14 15 6' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' />
                      </svg>
                    </span>
                    {label}
                  </label>
                ))}
              </div>
            </section>
          ) : (
            <section className='space-y-4 rounded-[1.5rem] border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/60'>
              <h4 className='text-sm font-black uppercase tracking-[0.16em] text-primary'>Dimensions mobilier</h4>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                {(['height', 'width', 'length', 'weight'] as const).map((key, index) => (
                  <Field key={key} label={['Hauteur', 'Largeur', 'Longueur', 'Poids'][index]} type='number' value={formData[key]} onChange={value => setFormData(current => ({ ...current, [key]: value }))} />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className='flex justify-end gap-3 border-t border-orange-100 bg-white px-6 py-5'>
          <button type='button' onClick={onClose} className='rounded-xl px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100'>Annuler</button>
          <button type='submit' disabled={isSaving} className='rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50'>
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', textarea = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; textarea?: boolean }) {
  return (
    <div>
      <label className='mb-1 block text-sm font-bold text-gray-700'>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={event => onChange(event.target.value)} rows={4} className='w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100' />
      ) : (
        <input type={type} value={value} onChange={event => onChange(event.target.value)} className='w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100' />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return (
    <div>
      <label className='mb-1 block text-sm font-bold text-gray-700'>{label}</label>
      <select value={value} onChange={event => onChange(event.target.value)} className='w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100'>
        {options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </div>
  );
}
