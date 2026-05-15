'use client';

import { FormEvent, useEffect, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { MdMyLocation } from 'react-icons/md';

import { addressApi, ReverseGeocodeResult } from '@services/addressApi';
import { getAd, updateAd } from '@services/announceApi';
import { Ad } from '@utils/types';

interface EditAdModalProps {
  ad: Ad;
  onClose: () => void;
  onUpdated?: (ad: Ad) => void;
}

type AmenityKey =
  | 'wifi'
  | 'air_conditioning'
  | 'security_24h'
  | 'equipped_kitchen'
  | 'smart_tv'
  | 'gate'
  | 'pool'
  | 'garage'
  | 'furnitured'
  | 'garden';

const boolToString = (value: unknown) => (value ? '1' : '0');
const hasValue = (value: unknown) => value !== null && value !== undefined;
const valueToString = (value: unknown) => (hasValue(value) ? String(value) : '');
const valueToBool = (value: unknown) => value === true || value === 1 || value === '1';

const amenitiesList: Array<[AmenityKey, string]> = [
  ['wifi', 'WiFi inclus'],
  ['air_conditioning', 'Climatisation'],
  ['security_24h', 'Sécurité 24h/24'],
  ['equipped_kitchen', 'Cuisine équipée'],
  ['smart_tv', 'Smart TV'],
  ['gate', 'Portail sécurisé'],
  ['pool', 'Piscine'],
  ['garage', 'Garage'],
  ['furnitured', 'Meublé'],
  ['garden', 'Jardin'],
];

function getAdDetails(ad: Ad) {
  return {
    description: valueToString(ad.description),
    price: valueToString(ad.price),
    period: valueToString(ad.period),
    devise: valueToString(ad.devise || 'XAF'),
    contact_phone: valueToString(ad.contact_phone),
    contact_email: valueToString(ad.contact_email),
    bedroom: valueToString(ad.bedroom),
    mainroom: valueToString(ad.mainroom),
    toilet: valueToString(ad.toilet),
    kitchen: valueToString(ad.kitchen),
    size: valueToString(ad.size),
    caution: valueToString(ad.caution),
    height: valueToString(ad.height),
    width: valueToString(ad.width),
    length: valueToString(ad.length),
    weight: valueToString(ad.weight),
  };
}

function getAdCoordinates(ad: Ad) {
  return {
    longitude: valueToString(ad.longitude),
    latitude: valueToString(ad.latitude),
  };
}

function getAdAmenities(ad: Ad): Record<AmenityKey, boolean> {
  return {
    wifi: valueToBool(ad.wifi),
    air_conditioning: valueToBool(ad.air_conditioning),
    security_24h: valueToBool(ad.security_24h),
    equipped_kitchen: valueToBool(ad.equipped_kitchen),
    smart_tv: valueToBool(ad.smart_tv),
    gate: valueToBool(ad.gate),
    pool: valueToBool(ad.pool),
    garage: valueToBool(ad.garage),
    furnitured: valueToBool(ad.furnitured),
    garden: valueToBool(ad.garden),
  };
}

export default function EditAdModal({ ad, onClose, onUpdated }: EditAdModalProps) {
  const isRealestate = ad.type === 'realestate';
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAdDetails, setIsLoadingAdDetails] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [detectedLocation, setDetectedLocation] = useState<ReverseGeocodeResult | null>(null);
  const [showCoordinates, setShowCoordinates] = useState(hasValue(ad.longitude) && hasValue(ad.latitude));
  const [details, setDetails] = useState(() => getAdDetails(ad));
  const [coordinates, setCoordinates] = useState(() => getAdCoordinates(ad));
  const [amenities, setAmenities] = useState<Record<AmenityKey, boolean>>(() => getAdAmenities(ad));

  const longitude = Number(coordinates.longitude.replace(',', '.'));
  const latitude = Number(coordinates.latitude.replace(',', '.'));
  const hasCoordinates = Number.isFinite(longitude) && Number.isFinite(latitude) && coordinates.longitude !== '' && coordinates.latitude !== '';

  useEffect(() => {
    let cancelled = false;

    const applyAd = (nextAd: Ad) => {
      setDetails(getAdDetails(nextAd));
      setCoordinates(getAdCoordinates(nextAd));
      setAmenities(getAdAmenities(nextAd));
      setShowCoordinates(hasValue(nextAd.longitude) && hasValue(nextAd.latitude));
      setLocationError('');
      setDetectedLocation(null);
    };

    applyAd(ad);

    const loadDetailedAd = async () => {
      try {
        setIsLoadingAdDetails(true);
        const detailedAd = await getAd(ad.id);
        if (!cancelled) {
          applyAd(detailedAd);
        }
      } catch {
        if (!cancelled) {
          setLocationError('Impossible de charger toutes les informations existantes.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAdDetails(false);
        }
      }
    };

    void loadDetailedAd();

    return () => {
      cancelled = true;
    };
  }, [ad]);

  useEffect(() => {
    if (!hasCoordinates) {
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
  }, [hasCoordinates, latitude, longitude]);

  const updateDetail = (key: keyof typeof details, value: string) => {
    setDetails(current => ({ ...current, [key]: value }));
  };

  const updateAmenity = (key: AmenityKey, checked: boolean) => {
    setAmenities(current => ({ ...current, [key]: checked }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }

    setIsGettingCurrentLocation(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      position => {
        setCoordinates({
          longitude: String(position.coords.longitude),
          latitude: String(position.coords.latitude),
        });
        setShowCoordinates(true);
        setIsGettingCurrentLocation(false);
      },
      () => {
        setLocationError("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.");
        setIsGettingCurrentLocation(false);
      },
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (hasCoordinates && (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90)) {
      setLocationError('Coordonnées GPS invalides.');
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateAd(ad.id, {
        description: details.description,
        price: Number(details.price),
        period: details.period,
        devise: details.devise,
        contact_phone: details.contact_phone,
        contact_email: details.contact_email,
        ...(hasCoordinates ? { localization: [String(longitude), String(latitude)] } : {}),
        ...(isRealestate
          ? {
              bedroom: Number(details.bedroom || 0),
              mainroom: Number(details.mainroom || 0),
              toilet: Number(details.toilet || 0),
              kitchen: Number(details.kitchen || 0),
              size: details.size ? Number(details.size) : null,
              caution: details.caution ? Number(details.caution) : null,
              ...Object.fromEntries(
                amenitiesList.map(([key]) => [key, boolToString(amenities[key])]),
              ),
            }
          : {
              height: details.height ? Number(details.height) : null,
              width: details.width ? Number(details.width) : null,
              length: details.length ? Number(details.length) : null,
              weight: details.weight ? Number(details.weight) : null,
            }),
      });

      onUpdated?.(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto overscroll-contain'>
      <div className='flex min-h-dvh items-stretch justify-center p-0 text-center sm:items-center sm:p-4'>
        <div className='fixed inset-0 bg-gray-500 opacity-75' aria-hidden='true' />

        <form onSubmit={handleSubmit} className='relative flex h-dvh w-full max-w-4xl flex-col overflow-hidden bg-white text-left shadow-2xl sm:h-[86vh] sm:rounded-2xl'>
          <div className='flex h-full flex-col bg-white px-4 pb-4 pt-4 sm:px-8 sm:pb-8 sm:pt-6'>
            <div className='mb-2 flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 sm:text-2xl'>Modifier l'annonce</h3>
                <p className='mt-1 text-sm text-gray-500'>Mettez les informations de votre bien à jour.</p>
              </div>
              <button type='button' onClick={onClose} className='shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700' aria-label='Fermer'>
                ×
              </button>
            </div>

            <div className='mt-3 min-h-0 flex-1 space-y-5 overflow-y-auto px-1 pb-2 pr-1 sm:mt-4 sm:space-y-6'>
              <Section title='Essentiel'>
                <Field label='Description' textarea value={details.description} onChange={value => updateDetail('description', value)} />
                <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <Field label='Téléphone à afficher' type='tel' value={details.contact_phone} onChange={value => updateDetail('contact_phone', value)} />
                  <Field label='Email à afficher' type='email' value={details.contact_email} onChange={value => updateDetail('contact_email', value)} />
                </div>
                {isLoadingAdDetails && <p className='mt-3 text-sm font-semibold text-orange-600'>Chargement des informations existantes...</p>}
              </Section>

              <Section title='Prix et disponibilité'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <Field label='Prix' type='number' value={details.price} onChange={value => updateDetail('price', value)} />
                  <Select label='Devise' value={details.devise} onChange={value => updateDetail('devise', value)} options={[['XAF', 'FCFA'], ['EUR', 'EUR'], ['USD', 'USD']]} />
                  <Select label='Période' value={details.period} onChange={value => updateDetail('period', value)} options={[['', 'Non précisée'], ['hour', 'Heure'], ['day', 'Jour'], ['night', 'Nuit'], ['month', 'Mois'], ['year', 'Année']]} />
                </div>
              </Section>

              <Section title='Localisation'>
                <div className='rounded-xl border border-gray-200 bg-gray-50 p-4'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                      <div className='flex items-center gap-2 text-sm font-semibold text-gray-800'>
                        <MapPinIcon className='h-5 w-5 text-orange-500' />
                        Position exacte du bien
                      </div>
                      <p className='mt-1 text-xs text-gray-500'>Domilix détectera l'adresse depuis ces coordonnées.</p>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <button type='button' onClick={getCurrentLocation} disabled={isGettingCurrentLocation} className='inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400'>
                        <MdMyLocation className={`h-4 w-4 ${isGettingCurrentLocation ? 'animate-pulse' : ''}`} />
                        {isGettingCurrentLocation ? 'Récupération...' : 'Position actuelle'}
                      </button>
                      <button type='button' onClick={() => setShowCoordinates(value => !value)} className='rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-50'>
                        {showCoordinates ? 'Masquer' : 'Saisie manuelle'}
                      </button>
                    </div>
                  </div>

                  {(showCoordinates || hasCoordinates) && (
                    <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      <Field label='Longitude' inputMode='decimal' value={coordinates.longitude} onChange={value => setCoordinates(current => ({ ...current, longitude: value }))} />
                      <Field label='Latitude' inputMode='decimal' value={coordinates.latitude} onChange={value => setCoordinates(current => ({ ...current, latitude: value }))} />
                    </div>
                  )}
                </div>

                <p className='mt-4 rounded-lg border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-orange-800'>
                  Après enregistrement, le backend utilisera ces coordonnées pour détecter automatiquement l'adresse, la ville, la région et le pays.
                </p>

                {(isDetectingLocation || detectedLocation) && (
                  <div className='mt-4 rounded-lg border border-gray-200 bg-white p-4'>
                    <h5 className='text-sm font-semibold text-gray-800'>Lieu détecté</h5>
                    {isDetectingLocation ? (
                      <p className='mt-2 text-sm text-gray-500'>Détection en cours...</p>
                    ) : detectedLocation && (
                      <div className='mt-2 space-y-1 text-sm text-gray-700'>
                        {detectedLocation.address && <p><strong>Adresse :</strong> {detectedLocation.address}</p>}
                        {detectedLocation.neighbourhood && <p><strong>Quartier :</strong> {detectedLocation.neighbourhood}</p>}
                        {detectedLocation.city && <p><strong>Ville :</strong> {detectedLocation.city}</p>}
                        {detectedLocation.state && <p><strong>Région :</strong> {detectedLocation.state}</p>}
                        {detectedLocation.country && <p><strong>Pays :</strong> {detectedLocation.country}</p>}
                        {detectedLocation.zip && <p><strong>Code postal :</strong> {detectedLocation.zip}</p>}
                      </div>
                    )}
                  </div>
                )}
                {locationError && <p className='mt-3 text-sm font-semibold text-red-600'>{locationError}</p>}
              </Section>

              {isRealestate ? (
                <Section title='Caractéristiques immobilier'>
                  <div className='grid grid-cols-2 gap-4 sm:grid-cols-5'>
                    <Field label='Chambres' type='number' value={details.bedroom} onChange={value => updateDetail('bedroom', value)} />
                    <Field label='Salons' type='number' value={details.mainroom} onChange={value => updateDetail('mainroom', value)} />
                    <Field label='Toilettes' type='number' value={details.toilet} onChange={value => updateDetail('toilet', value)} />
                    <Field label='Cuisines' type='number' value={details.kitchen} onChange={value => updateDetail('kitchen', value)} />
                    <Field label='Caution' type='number' value={details.caution} onChange={value => updateDetail('caution', value)} />
                    <Field label='Taille (m²)' type='number' value={details.size} onChange={value => updateDetail('size', value)} />
                  </div>

                  <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    {amenitiesList.map(([key, label]) => (
                      <AmenityCheckbox key={key} label={label} checked={amenities[key]} onChange={checked => updateAmenity(key, checked)} />
                    ))}
                  </div>
                </Section>
              ) : (
                <Section title='Dimensions mobilier'>
                  <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                    <Field label='Hauteur' type='number' value={details.height} onChange={value => updateDetail('height', value)} />
                    <Field label='Largeur' type='number' value={details.width} onChange={value => updateDetail('width', value)} />
                    <Field label='Longueur' type='number' value={details.length} onChange={value => updateDetail('length', value)} />
                    <Field label='Poids' type='number' value={details.weight} onChange={value => updateDetail('weight', value)} />
                  </div>
                </Section>
              )}
            </div>

            <div className='mt-3 flex items-center justify-end gap-3 border-t border-gray-100 bg-white pt-4 sm:mt-8 sm:pt-6'>
              <button type='button' onClick={onClose} className='px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-800 sm:px-6 sm:text-base'>Annuler</button>
              <button type='submit' disabled={isSaving} className='rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:bg-gray-300'>
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='rounded-2xl border border-gray-100 bg-white p-4'>
      <h4 className='mb-4 text-sm font-semibold text-gray-900'>{title}</h4>
      {children}
    </section>
  );
}

function AmenityCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className='flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-100 transition hover:ring-orange-200'>
      <input type='checkbox' checked={checked} onChange={event => onChange(event.target.checked)} className='h-4 w-4 accent-orange-500' />
      {label}
    </label>
  );
}

function Field({ label, value, onChange, type = 'text', inputMode, textarea = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; textarea?: boolean }) {
  return (
    <div>
      <label className='mb-1 block text-sm font-bold text-gray-700'>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={event => onChange(event.target.value)} rows={4} className='w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100' />
      ) : (
        <input type={type} inputMode={inputMode} value={value} onChange={event => onChange(event.target.value)} className='w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100' />
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
