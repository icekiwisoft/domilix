'use client';

import { updateAd } from '@services/announceApi';
import { Ad } from '@utils/types';
import { FormEvent, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditAdModalProps {
  ad: Ad;
  onClose: () => void;
  onUpdated?: (ad: Ad) => void;
}

const boolToString = (value: unknown) => (value ? '1' : '0');

export default function EditAdModal({ ad, onClose, onUpdated }: EditAdModalProps) {
  const [isSaving, setIsSaving] = useState(false);
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
  });
  const isRealestate = ad.type === 'realestate';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      const updated = await updateAd(ad.id, {
        description: formData.description,
        price: Number(formData.price),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zip: formData.zip,
        period: formData.period,
        devise: formData.devise,
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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm'>
      <form onSubmit={handleSubmit} className='w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-5 flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-black text-gray-900'>Modifier l'annonce</h3>
            <p className='text-sm text-gray-500'>Mettez à jour les champs acceptés par l'API.</p>
          </div>
          <button type='button' onClick={onClose} className='rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700' aria-label='Fermer'>
            <XMarkIcon className='h-5 w-5' />
          </button>
        </div>

        <div className='max-h-[70vh] space-y-4 overflow-y-auto pr-1'>
          <Field label='Description' textarea value={formData.description} onChange={value => setFormData(current => ({ ...current, description: value }))} />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Field label='Prix' type='number' value={formData.price} onChange={value => setFormData(current => ({ ...current, price: value }))} />
            <Select label='Devise' value={formData.devise} onChange={value => setFormData(current => ({ ...current, devise: value }))} options={[['XAF', 'FCFA'], ['EUR', 'EUR'], ['USD', 'USD']]} />
            <Select label='Période' value={formData.period} onChange={value => setFormData(current => ({ ...current, period: value }))} options={[['', 'Non précisée'], ['hour', 'Heure'], ['day', 'Jour'], ['night', 'Nuit'], ['month', 'Mois'], ['year', 'Année']]} />
            <Field label='Ville' value={formData.city} onChange={value => setFormData(current => ({ ...current, city: value }))} />
          </div>
          <Field label='Adresse' value={formData.address} onChange={value => setFormData(current => ({ ...current, address: value }))} />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {(['state', 'country', 'zip'] as const).map((key, index) => (
              <Field key={key} label={['Région', 'Pays', 'Code postal'][index]} value={formData[key]} onChange={value => setFormData(current => ({ ...current, [key]: value }))} />
            ))}
          </div>

          {isRealestate ? (
            <div className='space-y-4 rounded-2xl border border-orange-100 bg-orange-50/40 p-4'>
              <h4 className='font-black text-gray-900'>Caractéristiques immobilier</h4>
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
            </div>
          ) : (
            <div className='space-y-4 rounded-2xl border border-orange-100 bg-orange-50/40 p-4'>
              <h4 className='font-black text-gray-900'>Dimensions mobilier</h4>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                {(['height', 'width', 'length', 'weight'] as const).map((key, index) => (
                  <Field key={key} label={['Hauteur', 'Largeur', 'Longueur', 'Poids'][index]} type='number' value={formData[key]} onChange={value => setFormData(current => ({ ...current, [key]: value }))} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='mt-6 flex justify-end gap-3'>
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
