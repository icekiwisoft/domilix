'use client';

import { Listbox, Transition } from '@headlessui/react';
import api from '@services/api';
import { addressApi, ReverseGeocodeResult } from '@services/addressApi';
import { uploadApi } from '@services/uploadApi';
import { Category } from '@utils/types';
import axios from 'axios';
import { FormEvent, Fragment, useEffect, useState } from 'react';
import { HiChevronUpDown, HiRocketLaunch } from 'react-icons/hi2';
import { MdMyLocation } from 'react-icons/md';
import HoneypotInput from '@components/HoneypotInput/HoneypotInput';

interface SelectData {
  key: string;
  name: string;
}

const MAX_ANNOUNCE_MEDIAS = 10;

// Component principal pour créer une annonce avec un dialogue
export default function ArticlePostDialog({
  toggleDialog,
}: {
  toggleDialog: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<SelectData | null>(null);
  const [selectedAdType, setSelectedAdType] = useState<SelectData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SelectData | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // Étape actuelle dans le processus de création d'annonce
  const totalSteps = 4; // Nombre total d'étapes
  const [selectedCurrency, setSelectedCurrency] = useState<SelectData | null>(
    null
  ); // Devise par défaut
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [detectedLocation, setDetectedLocation] = useState<ReverseGeocodeResult | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [longitudeInput, setLongitudeInput] = useState('');
  const [latitudeInput, setLatitudeInput] = useState('');
  const [website, setWebsite] = useState('');
  const [useManualCoordinates, setUseManualCoordinates] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    price: '',
    type: 'realestate',
    ad_type: '',
    bedroom: 0,
    mainroom: 0,
    toilet: 0,
    kitchen: 0,
    size: 0,
    medias: [] as File[],
    wifi: false,
    air_conditioning: false,
    security_24h: false,
    smart_tv: false,
    equipped_kitchen: false,
    gate: false,
    pool: false,
    garage: false,
    furnitured: false,
    localization: [0, 0] as [number, number],
    period: '',
    description: '',
    contact_phone: '',
    contact_email: '',
    devise: '',
    // Nouveaux champs d'adresse
    address: '',
    city: '',
    state: '',
    country: '',
    zip: '',
  });

  let priorityMediaIndex: number = 0;

  // Données pour le type et la période
  const Type = [{ key: 'realestate', name: 'Immobilier' }];
  const Period = [
    { key: 'hour', name: 'Heure' },
    { key: 'day', name: 'Jour' },
    { key: 'night', name: 'Nuit' },
    { key: 'month', name: 'Mois' },
    { key: 'year', name: 'Année' },
  ];
  const Currency = [
    {
      key: 'XAF',
      name: 'FCFA',
    },
    {
      key: 'EUR',
      name: 'EUR',
    },
  ];
  const adType = [
    {
      key: 'location',
      name: 'Location',
    },
    {
      key: 'sale',
      name: 'Vente',
    },
  ];

  // Initialisation par défaut des types et périodes sélectionnés, et chargement des catégories
  useEffect(() => {
    setSelectedType(Type[0]);
    setSelectedPeriod(Period[2]);
    setSelectedCurrency(Currency[0]);
    setSelectedAdType(adType[0]);
    fetchCategories(formData?.type == 'realestate' ? 'house' : 'furniture');
  }, []);

  // Mise à jour de formData en fonction de la catégorie, du type et de la période sélectionnés
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category_id: selectedCategory?.id || '',
      period:
        selectedAdType?.key === 'location' ? selectedPeriod?.key || '' : '',
      ad_type: selectedAdType?.key || '',
      devise: selectedCurrency?.key || '',
    }));
  }, [selectedCategory, selectedPeriod, selectedAdType, selectedCurrency]);

  // Réinitialiser la période quand on change de type d'annonce
  useEffect(() => {
    if (selectedAdType?.key === 'sale') {
      setSelectedPeriod(null);
    } else if (selectedAdType?.key === 'location' && !selectedPeriod) {
      setSelectedPeriod(Period[3]); // Défaut sur "Mois"
    }
  }, [selectedAdType]);

  useEffect(() => {
    fetchCategories(formData?.type == 'realestate' ? 'house' : 'furniture');
    setFormData(prev => ({
      ...prev,
      type: selectedType?.key || 'realestate',
    }));
  }, [selectedType]);

  // Récupération des catégories à partir de l'API
  const fetchCategories = async (type: string) => {
    try {
      const response = await api.get('/categories', {
        params: { type },
      });
      console.log(response);
      setCategories(response.data.data);
      setSelectedCategory(response.data.data[0]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fonction pour obtenir la géolocalisation actuelle
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingCurrentLocation(true);
      setLocationError('');
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            localization: [longitude, latitude],
          }));
          setLongitudeInput(String(longitude));
          setLatitudeInput(String(latitude));
          setUseManualCoordinates(true);
          setLocationError('');
          setIsGettingCurrentLocation(false);
        },
        error => {
          console.error('Erreur de géolocalisation:', error);
          setLocationError("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.");
          setIsGettingCurrentLocation(false);
        }
      );
    } else {
      setLocationError("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  const handleLocalizationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const rawValue = (e.target as HTMLInputElement).value;
    const value = rawValue === '' ? 0 : Number(rawValue.replace(',', '.'));
    if (index === 0) setLongitudeInput(rawValue);
    else setLatitudeInput(rawValue);

    if (rawValue !== '' && Number.isNaN(value)) return;
    setLocationError('');
    setFormData(prev => ({
      ...prev,
      localization:
        index === 0
          ? [value, prev.localization[1]] // Update longitude
          : [prev.localization[0], value], // Update latitude
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

  const handlePriorityChange = (index: any) => {
    setFormData(prevData => {
      const updatedMedias = [...prevData.medias];
      const [selectedMedia] = updatedMedias.splice(index, 1);
      priorityMediaIndex = index;
      updatedMedias.unshift(selectedMedia); // Place le média prioritaire en première position
      return {
        ...prevData,
        medias: updatedMedias, // Met à jour l'index de priorité
      };
    });
  };

  // Fonction pour supprimer un media
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medias: prev.medias.filter((_, i) => i !== index),
    }));
    setMediaError('');
  };

  // Gestion des changements de formulaire (entrées texte et cases à cocher)
  const handleChange = (e: FormEvent) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const nonNegativeFields = ['bedroom', 'mainroom', 'toilet', 'kitchen', 'size'];
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'localization') {
      const [latitude, longitude] = value.split(',').map(Number);
      setFormData(prev => ({ ...prev, localization: [latitude, longitude] }));
    } else if (nonNegativeFields.includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Math.max(0, Number(value)) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Gestion du changement de medias avec upload multiple
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const allowedFiles = selectedFiles.filter(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (allowedFiles.length !== selectedFiles.length) {
      setMediaError('Seules les images et les vidéos sont acceptées.');
    } else {
      setMediaError('');
    }

    setFormData(prev => {
      const availableSlots = MAX_ANNOUNCE_MEDIAS - prev.medias.length;
      if (availableSlots <= 0) {
        setMediaError(`Vous pouvez ajouter ${MAX_ANNOUNCE_MEDIAS} médias maximum.`);
        return prev;
      }

      const nextFiles = allowedFiles.slice(0, availableSlots);
      if (allowedFiles.length > availableSlots) {
        setMediaError(`Vous pouvez ajouter ${MAX_ANNOUNCE_MEDIAS} médias maximum.`);
      }

      return { ...prev, medias: [...prev.medias, ...nextFiles] };
    });

    e.target.value = '';
  };

  // Soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (formData.medias.length > MAX_ANNOUNCE_MEDIAS) {
      setMediaError(`Vous pouvez ajouter ${MAX_ANNOUNCE_MEDIAS} médias maximum.`);
      return;
    }
    if (!formData.localization[0] || !formData.localization[1]) {
      setLocationError('Veuillez utiliser votre position actuelle ou saisir la longitude et la latitude.');
      setCurrentStep(3);
      return;
    }

    try {
      setIsSubmitting(true);
      const uploadedMedias = await Promise.all(
        formData.medias.map(file => uploadApi.uploadFile(file, 'media')),
      );

      const data = {
        category_id: formData.category_id,
        price: formData.price,
        type: formData.type,
        ad_type: formData.ad_type,
        bedroom: formData.bedroom.toString(),
        mainroom: formData.mainroom.toString(),
        toilet: formData.toilet.toString(),
        kitchen: formData.kitchen.toString(),
        size: formData.size.toString(),
        wifi: formData.wifi ? '1' : '0',
        air_conditioning: formData.air_conditioning ? '1' : '0',
        security_24h: formData.security_24h ? '1' : '0',
        smart_tv: formData.smart_tv ? '1' : '0',
        equipped_kitchen: formData.equipped_kitchen ? '1' : '0',
        gate: formData.gate ? '1' : '0',
        pool: formData.pool ? '1' : '0',
        garage: formData.garage ? '1' : '0',
        furnitured: formData.furnitured ? '1' : '0',
        period: formData.period,
        description: formData.description,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        devise: formData.devise,
        localization: [formData.localization[0].toString(), formData.localization[1].toString()],
        website,
        media_ids: uploadedMedias.map(media => media.id),
        media_types: uploadedMedias.map(media => media.mime_type),
      };

      const response = await api.post('/announces', data);

      console.log("Réponse de l'API :", response.data);
      toggleDialog(); // Ferme la boîte de dialogue après validation
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Titres des étapes
  const stepTitles = [
    'Informations générales',
    'Caractéristiques',
    'Localisation & Photos',
    'Prix & Description',
  ];

  // Stepper responsive avec titres
  const renderSteppers = () => (
    <div className='w-full py-3 sm:py-4'>
      <div className='flex gap-3 overflow-x-auto pb-2 sm:block sm:space-y-4 sm:overflow-visible sm:pb-0'>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className='flex min-w-[11rem] items-center sm:min-w-0'>
            <div className='flex items-center'>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  currentStep > i + 1
                    ? 'bg-orange-500 text-white'
                    : currentStep === i + 1
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > i + 1 ? (
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <div className='ml-3'>
                <div
                  className={`text-sm font-medium transition-colors duration-300 ${
                    currentStep === i + 1
                      ? 'text-orange-600'
                      : currentStep > i + 1
                        ? 'text-green-600'
                        : 'text-gray-500'
                  }`}
                >
                  {stepTitles[i]}
                </div>
                {currentStep === i + 1 && (
                  <div className='text-xs text-gray-400 mt-0.5'>
                    Étape {i + 1} sur {totalSteps}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Rendu du contenu pour chaque étape avec un design amélioré
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Type de bien */}
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Genre
                </label>
                <Listbox value={selectedType} onChange={setSelectedType}>
                  <div className='relative'>
                    <Listbox.Button className='relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border-2 border-gray-200 hover:border-orange-500 transition-colors duration-200 text-sm'>
                      <span className='block truncate'>
                        {selectedType
                          ? selectedType.name
                          : 'Sélectionner un type'}
                      </span>
                      <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                        <HiChevronUpDown className='h-4 w-4 text-gray-400' />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                    >
                      <Listbox.Options className='absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5 focus:outline-none'>
                        {Type.map(type => (
                          <Listbox.Option
                            key={type.key}
                            value={type}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                active
                                  ? 'bg-orange-50 text-orange-900'
                                  : 'text-gray-900'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                >
                                  {type.name}
                                </span>
                                {selected && (
                                  <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500'>
                                    <svg
                                      className='w-5 h-5'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>

              {/* Catégorie */}
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Catégorie
                </label>
                <Listbox
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                >
                  <div className='relative'>
                    <Listbox.Button className='relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border-2 border-gray-200 hover:border-orange-500 transition-colors duration-200 text-sm'>
                      <span className='block truncate'>
                        {selectedCategory
                          ? selectedCategory.name
                          : 'Sélectionner une catégorie'}
                      </span>
                      <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                        <HiChevronUpDown className='h-4 w-4 text-gray-400' />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                    >
                      <Listbox.Options className='absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5 focus:outline-none'>
                        {categories.map(category => (
                          <Listbox.Option
                            key={category.id}
                            value={category}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                active
                                  ? 'bg-orange-50 text-orange-900'
                                  : 'text-gray-900'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                >
                                  {category.name}
                                </span>
                                {selected && (
                                  <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500'>
                                    <svg
                                      className='w-5 h-5'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            </div>

            {/* Type d'annonce */}
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-gray-700'>
                Type d'annonce
              </label>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {adType.map(type => (
                  <button
                    key={type.key}
                    type='button'
                    onClick={() => setSelectedAdType(type)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedAdType?.key === type.key
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <div className='flex items-center justify-center space-x-2'>
                      {type.key === 'location' ? (
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                          />
                        </svg>
                      ) : (
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                          />
                        </svg>
                      )}
                      <span className='font-medium'>{type.name}</span>
                    </div>
                    <div className='text-xs mt-1 opacity-75'>
                      {type.key === 'location'
                        ? 'Louer votre bien'
                        : 'Vendre votre bien'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-4'>
            {/* Caractéristiques principales */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Chambres
                </label>
                <div className='relative'>
                  <input
                    type='number'
                    min={0}
                    name='bedroom'
                    value={formData.bedroom}
                    onChange={handleChange}
                    className='w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm'
                    placeholder='Nombre'
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Salons
                </label>
                <div className='relative'>
                  <input
                    type='number'
                    min={0}
                    name='mainroom'
                    value={formData.mainroom}
                    onChange={handleChange}
                    className='w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm'
                    placeholder='Nombre'
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Toilettes
                </label>
                <div className='relative'>
                  <input
                    type='number'
                    min={0}
                    name='toilet'
                    value={formData.toilet}
                    onChange={handleChange}
                    className='w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm'
                    placeholder='Nombre'
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 14l-7 7m0 0l-7-7m7 7V3'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Cuisines
                </label>
                <div className='relative'>
                  <input
                    type='number'
                    min={0}
                    name='kitchen'
                    value={formData.kitchen}
                    onChange={handleChange}
                    className='w-full px-3 py-2 pr-10 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm'
                    placeholder='Nombre'
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Taille (m²)
                </label>
                <input
                  type='number'
                  min={0}
                  name='size'
                  value={formData.size}
                  onChange={handleChange}
                  className='w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm'
                  placeholder='Surface'
                />
              </div>
              <label
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  formData.furnitured
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <input
                  type='checkbox'
                  name='furnitured'
                  checked={formData.furnitured}
                  onChange={handleChange}
                  className='peer sr-only'
                />
                <span className={`font-medium ${formData.furnitured ? 'text-orange-700' : 'text-gray-700'}`}>
                  Bien meublé
                </span>
                <span className='ml-auto flex h-6 w-6 items-center justify-center rounded-lg border-2 border-gray-200 bg-white transition-all peer-checked:border-orange-500 peer-checked:bg-orange-500'>
                  <svg className='h-4 w-4 scale-0 text-white transition-transform peer-checked:scale-100' viewBox='0 0 20 20' fill='none' aria-hidden='true'>
                    <path d='M5 10.5 8.2 14 15 6' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' />
                  </svg>
                </span>
              </label>
            </div>

            {/* Commodités */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium text-gray-700'>Commodités</h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                {[
                  {
                    key: 'wifi',
                    label: 'WiFi inclus',
                    icon: (
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8.111 16.404a5 5 0 017.778 0M12 20h.01M4.93 12.465a10 10 0 0114.14 0M1.394 8.929a15 15 0 0121.213 0'
                        />
                      </svg>
                    ),
                  },
                  {
                    key: 'air_conditioning',
                    label: 'Climatisation',
                    icon: (
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 3v18m6.364-15.364L5.636 18.364m12.728 0L5.636 5.636M4 12h16'
                        />
                      </svg>
                    ),
                  },
                  {
                    key: 'security_24h',
                    label: 'Sécurité 24h/24',
                    icon: (
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12l2 2 4-4m5-4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3 8 3z'
                        />
                      </svg>
                    ),
                  },
                  {
                    key: 'equipped_kitchen',
                    label: 'Cuisine équipée',
                    icon: (
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 3v18m4-18v7a4 4 0 01-4 4m10-11v18m5-18v18'
                        />
                      </svg>
                    ),
                  },
                  {
                    key: 'smart_tv',
                    label: 'Smart TV',
                    icon: (
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M7 21h10M4 5h16v11H4z'
                        />
                      </svg>
                    ),
                  },
                  {
                    key: 'gate',
                    label: 'Portail sécurisé',
                    icon: (
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                        />
                      </svg>
                    ),
                  },
                  {
                    key: 'pool',
                    label: 'Piscine',
                    icon: (
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 12h18M7 6h10M7 18h10'
                        />
                      </svg>
                    ),
                  },
                  {
                    key: 'garage',
                    label: 'Garage',
                    icon: (
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 3h18v18H3z M3 12h18 M9 3v18'
                        />
                      </svg>
                    ),
                  },
                ].map(amenity => (
                  <label
                    key={amenity.key}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData[amenity.key as keyof typeof formData]
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <input
                      type='checkbox'
                      name={amenity.key}
                      checked={
                        formData[
                          amenity.key as keyof typeof formData
                        ] as boolean
                      }
                      onChange={handleChange}
                      className='peer sr-only'
                    />
                    <span className='mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-gray-200 bg-white transition-all peer-checked:border-orange-500 peer-checked:bg-orange-500'>
                      <svg className='h-4 w-4 scale-0 text-white transition-transform peer-checked:scale-100' viewBox='0 0 20 20' fill='none' aria-hidden='true'>
                        <path d='M5 10.5 8.2 14 15 6' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' />
                      </svg>
                    </span>
                    <span
                      className={`mr-3 transition-colors duration-200 ${
                        formData[amenity.key as keyof typeof formData]
                          ? 'text-orange-500'
                          : 'text-gray-500'
                      }`}
                    >
                      {amenity.icon}
                    </span>
                    <span
                      className={`font-medium ${
                        formData[amenity.key as keyof typeof formData]
                          ? 'text-orange-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {amenity.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-4'>
            {/* Localisation avec autocomplétion */}
            <div className='space-y-4'>
              {/* Coordonnées exactes */}
              <div className='rounded-xl border border-gray-200 bg-gray-50 p-4'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h4 className='text-sm font-semibold text-gray-800'>Position exacte du bien</h4>
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
                    <div className='space-y-1.5'>
                      <label className='block text-sm font-medium text-gray-600'>
                        Longitude
                      </label>
                      <input
                        type='text'
                        inputMode='decimal'
                        value={longitudeInput || (formData.localization[0] ? String(formData.localization[0]) : '')}
                        onChange={event => handleLocalizationChange(event, 0)}
                        readOnly={!useManualCoordinates}
                        className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${useManualCoordinates ? 'bg-white' : 'bg-gray-100'}`}
                        placeholder='Ex: 9.700000'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label className='block text-sm font-medium text-gray-600'>
                        Latitude
                      </label>
                      <input
                        type='text'
                        inputMode='decimal'
                        value={latitudeInput || (formData.localization[1] ? String(formData.localization[1]) : '')}
                        onChange={event => handleLocalizationChange(event, 1)}
                        readOnly={!useManualCoordinates}
                        className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${useManualCoordinates ? 'bg-white' : 'bg-gray-100'}`}
                        placeholder='Ex: 4.050000'
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className='rounded-lg border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-orange-800'>
                Après publication, le backend utilisera ces coordonnées pour détecter automatiquement l'adresse, la ville, la région et le pays.
              </div>
              {(isDetectingLocation || detectedLocation) && (
                <div className='rounded-lg border border-gray-200 bg-white p-4'>
                  <h4 className='text-sm font-semibold text-gray-800'>Lieu détecté</h4>
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
              {locationError && (
                <p className='text-sm font-semibold text-red-600'>{locationError}</p>
              )}
            </div>

            {/* Upload de médias */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Photos et vidéos
              </label>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition-colors duration-200'>
                <input
                  type='file'
                  multiple
                  accept='image/*,video/*'
                  onChange={handleImageChange}
                  className='hidden'
                  id='media-upload'
                />
                <label htmlFor='media-upload' className='cursor-pointer'>
                  <div className='space-y-2'>
                    <div className='mx-auto w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 text-orange-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                    <div className='text-gray-600'>
                      <span className='text-orange-500 font-medium'>
                        Cliquez pour uploader
                      </span>{' '}
                      ou glissez et déposez
                    </div>
                    <p className='text-gray-500 text-sm'>
                      Images et vidéos jusqu'à {MAX_ANNOUNCE_MEDIAS} médias
                    </p>
                  </div>
                </label>
              </div>
              {mediaError && (
                <p className='text-sm font-semibold text-red-600'>{mediaError}</p>
              )}

              {/* Prévisualisation des médias */}
              {formData.medias.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-sm text-gray-500'>
                    Cliquez sur le média principal ({formData.medias.length}/{MAX_ANNOUNCE_MEDIAS})
                  </p>
                  <div className='grid grid-cols-6 gap-2'>
                    {formData.medias.map((media, index) => (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                          index === 0 ? 'ring-2 ring-orange-500' : ''
                        }`}
                      >
                        {media.type.startsWith('video/') ? (
                          <video
                            src={URL.createObjectURL(media)}
                            className='w-full h-full object-cover'
                            onClick={() => handlePriorityChange(index)}
                            muted
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(media)}
                            alt={`preview-${index}`}
                            className='w-full h-full object-cover'
                            onClick={() => handlePriorityChange(index)}
                          />
                        )}
                        {media.type.startsWith('video/') && (
                          <div className='absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white'>
                            Vidéo
                          </div>
                        )}
                        <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200' />

                        {/* Bouton de suppression */}
                        <button
                          type='button'
                          onClick={e => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className='absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600'
                        >
                          <svg
                            className='w-3 h-3'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>

                        {/* Indicateur d'image principale */}
                        {index === 0 && (
                          <div className='absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-2 py-1 rounded'>
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-4'>
            {/* Description */}
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-gray-700'>
                Description
              </label>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleChange}
                className='w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 min-h-[100px] resize-none text-sm'
                placeholder='Décrivez votre bien...'
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Téléphone à afficher
                </label>
                <input
                  type='tel'
                  name='contact_phone'
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className='w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm'
                  placeholder='Optionnel, sinon téléphone pro'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Email à afficher
                </label>
                <input
                  type='email'
                  name='contact_email'
                  value={formData.contact_email}
                  onChange={handleChange}
                  className='w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm'
                  placeholder='Optionnel, sinon email du profil'
                />
              </div>
            </div>

            {/* Prix et période */}
            <div
              className={`grid gap-4 ${selectedAdType?.key === 'location' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}
            >
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  {selectedAdType?.key === 'location'
                    ? 'Prix de location'
                    : 'Prix de vente'}
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    name='price'
                    value={formData.price}
                    onChange={handleChange}
                    className='w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 transition-all duration-200 text-sm'
                    placeholder={
                      selectedAdType?.key === 'location'
                        ? 'Montant par période'
                        : 'Prix total'
                    }
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center'>
                    <Listbox
                      value={selectedCurrency}
                      onChange={setSelectedCurrency}
                    >
                      <div className='relative'>
                        <Listbox.Button className='h-full px-4 text-gray-700 font-medium focus:outline-none'>
                          {selectedCurrency?.name}
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave='transition ease-in duration-100'
                          leaveFrom='opacity-100'
                          leaveTo='opacity-0'
                        >
                          <Listbox.Options className='absolute right-0 z-50 mt-2 w-24 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
                            {Currency.map(currency => (
                              <Listbox.Option
                                key={currency.key}
                                value={currency}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-2 px-4 ${
                                    active
                                      ? 'bg-orange-50 text-orange-900'
                                      : 'text-gray-900'
                                  }`
                                }
                              >
                                {currency.name}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>
                </div>
              </div>

              {/* Période - seulement pour les locations */}
              {selectedAdType?.key === 'location' && (
                <div className='space-y-1.5'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Période de paiement
                  </label>
                  <Listbox value={selectedPeriod} onChange={setSelectedPeriod}>
                    <div className='relative'>
                      <Listbox.Button className='relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border-2 border-gray-200 hover:border-orange-500 transition-colors duration-200 text-sm'>
                        <span className='block truncate'>
                          {selectedPeriod?.name || 'Sélectionner une période'}
                        </span>
                        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                          <HiChevronUpDown className='h-4 w-4 text-gray-400' />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <Listbox.Options className='absolute z-50 mt-2 w-full rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
                          {Period.map(period => (
                            <Listbox.Option
                              key={period.key}
                              value={period}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-3 pl-4 pr-4 ${
                                  active
                                    ? 'bg-orange-50 text-orange-900'
                                    : 'text-gray-900'
                                }`
                              }
                            >
                              {period.name}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto overscroll-contain'>
      <div className='flex min-h-dvh items-stretch justify-center p-0 text-center sm:items-center sm:p-4'>
        <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
          <div className='absolute inset-0 bg-gray-500 opacity-75'></div>
        </div>

        <div className='relative flex h-dvh w-full max-w-4xl transform flex-col overflow-hidden bg-white text-left shadow-2xl transition-all sm:h-[86vh] sm:rounded-2xl'>
          <div className='flex h-full flex-col bg-white px-4 pb-4 pt-4 sm:px-8 sm:pb-8 sm:pt-6'>
            <div className='mb-2 flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 sm:text-2xl'>
                  Créer une annonce
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  Partagez votre bien en quelques étapes
                </p>
              </div>
              <button
                onClick={toggleDialog}
                className='shrink-0 rounded-full p-2 hover:bg-gray-100 transition-colors duration-200'
              >
                <svg
                  className='w-5 h-5 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className='mt-3 flex min-h-0 flex-1 flex-col sm:mt-4'
            >
              <HoneypotInput value={website} onChange={setWebsite} />
              <div className='flex min-h-0 flex-1 flex-col gap-4 sm:flex-row sm:gap-8'>
                {/* Stepper vertical à gauche */}
                <div className='shrink-0 sm:w-64'>{renderSteppers()}</div>

                {/* Contenu principal à droite */}
                <div className='min-h-0 flex-1'>
                  <div className='h-full overflow-y-auto px-1 pb-2 pr-1'>
                    <div className='space-y-5 sm:space-y-6'>{renderStepContent()}</div>
                  </div>
                </div>
              </div>

              <div className='mt-3 flex items-center justify-between gap-3 border-t border-gray-100 bg-white pt-4 sm:mt-8 sm:pt-6'>
                {currentStep > 1 ? (
                  <button
                    type='button'
                    onClick={() => setCurrentStep(step => step - 1)}
                    className='px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-800 sm:px-6 sm:text-base'
                  >
                    ← Précédent
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type='button'
                    onClick={() => {
                      // Validation basique avant de passer à l'étape suivante
                      if (
                        currentStep === 1 &&
                        (!selectedCategory || !selectedAdType)
                      ) {
                        alert(
                          "Veuillez sélectionner une catégorie et un type d'annonce"
                        );
                        return;
                      }
                      if (currentStep === 3 && formData.medias.length === 0) {
                        setMediaError('Veuillez ajouter au moins une photo ou une vidéo.');
                        return;
                      }
                      setCurrentStep(step => step + 1);
                    }}
                    className='rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-orange-600 hover:shadow-md sm:px-8 sm:text-base'
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    type='submit'
                    disabled={
                      isSubmitting ||
                      !formData.price ||
                      !formData.description ||
                      formData.medias.length === 0 ||
                      (selectedAdType?.key === 'location' && !selectedPeriod)
                    }
                    className='rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:px-8 sm:text-base'
                  >
                    {isSubmitting ? (
                      <span className='flex items-center justify-center gap-2'>
                        <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
                        Publication...
                      </span>
                    ) : (
                      <span className='flex items-center justify-center gap-2'>
                        <HiRocketLaunch className='h-5 w-5' />
                        Publier
                      </span>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
