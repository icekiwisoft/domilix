import { Listbox, Transition } from '@headlessui/react';
import api from '@services/api';
import { Category } from '@utils/types';
import axios from 'axios';
import { FormEvent, Fragment, useEffect, useState } from 'react';
import { HiChevronUpDown } from 'react-icons/hi2';
import { MdMyLocation } from 'react-icons/md';
import AddressAutocomplete from '@components/AddressAutocomplete/AddressAutocomplete';

interface SelectData {
  key: string;
  name: string;
}

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

  const [formData, setFormData] = useState({
    category_id: '',
    price: '',
    type: 'realestate',
    ad_type: '',
    bedroom: 0,
    mainroom: 0,
    toilet: 0,
    kitchen: 0,
    medias: [] as File[],
    gate: false,
    pool: false,
    garage: false,
    furnitured: false,
    localization: [0, 0] as [number, number],
    period: '',
    description: '',
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
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            localization: [longitude, latitude],
          }));
        },
        error => {
          console.error('Erreur de géolocalisation:', error);
          alert(
            "Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation."
          );
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  const handleLocalizationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = parseFloat(e.target.value) || 0; // Convert input to a number
    setFormData(prev => ({
      ...prev,
      localization:
        index === 0
          ? [value, prev.localization[1]] // Update longitude
          : [prev.localization[0], value], // Update latitude
    }));
  };

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

  // Fonction pour supprimer une image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medias: prev.medias.filter((_, i) => i !== index),
    }));
  };

  // Gestion des changements de formulaire (entrées texte et cases à cocher)
  const handleChange = (e: FormEvent) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'localization') {
      const [latitude, longitude] = value.split(',').map(Number);
      setFormData(prev => ({ ...prev, localization: [latitude, longitude] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Gestion du changement d'image avec upload multiple
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, medias: [...prev.medias, ...files] }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Créez une instance de FormData
    const data = new FormData();

    // Ajoutez les champs du formulaire au FormData
    data.append('category_id', formData.category_id);
    data.append('price', formData.price);
    data.append('type', formData.type);
    data.append('ad_type', formData.ad_type);
    data.append('bedroom', formData.bedroom.toString());
    data.append('mainroom', formData.mainroom.toString());
    data.append('toilet', formData.toilet.toString());
    data.append('kitchen', formData.kitchen.toString());
    data.append('gate', formData.gate ? '1' : '0');
    data.append('pool', formData.pool ? '1' : '0');
    data.append('garage', formData.garage ? '1' : '0');
    data.append('furnitured', formData.furnitured ? '1' : '0');
    data.append('period', formData.period);
    data.append('description', formData.description);
    data.append('devise', formData.devise);

    // Ajoutez les coordonnées de localisation
    data.append('localization[]', formData.localization[0].toString());
    data.append('localization[]', formData.localization[1].toString());

    // Ajoutez les champs d'adresse
    data.append('address', formData.address);
    data.append('city', formData.city);
    data.append('state', formData.state);
    data.append('country', formData.country);
    data.append('zip', formData.zip);

    // Ajoutez les fichiers (images) au FormData
    formData.medias.forEach(file => {
      data.append('medias[]', file);
    });

    try {
      // console.log(formData);
      // for (let [key, value] of data.entries()) {
      //   console.log(key, value);
      // }
      // Envoyez la requête avec Axios
      const response = await api.post('/announces', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Réponse de l'API :", response.data);
      toggleDialog(); // Ferme la boîte de dialogue après validation
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
    }
  };

  // Titres des étapes
  const stepTitles = [
    'Informations générales',
    'Caractéristiques',
    'Localisation & Photos',
    'Prix & Description',
  ];

  // Stepper vertical avec titres
  const renderSteppers = () => (
    <div className='w-full py-4'>
      <div className='space-y-4'>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className='flex items-center'>
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
            <div className='grid grid-cols-2 gap-4'>
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
              <div className='grid grid-cols-2 gap-4'>
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
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Chambres
                </label>
                <div className='relative'>
                  <input
                    type='number'
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

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Toilettes
                </label>
                <div className='relative'>
                  <input
                    type='number'
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

            {/* Commodités */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium text-gray-700'>Commodités</h3>
              <div className='grid grid-cols-2 gap-3'>
                {[
                  {
                    key: 'gate',
                    label: 'Portail',
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
                  {
                    key: 'furnitured',
                    label: 'Meublé',
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
                          d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
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
                      className='hidden'
                    />
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
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-gray-700'>
                  Adresse du bien
                </label>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={address =>
                    setFormData(prev => ({ ...prev, address }))
                  }
                  onLocationSelect={location => {
                    setFormData(prev => ({
                      ...prev,
                      address: location.address,
                      city: location.city,
                      state: location.state,
                      country: location.country,
                      zip: location.zip,
                      localization: location.coordinates,
                    }));
                  }}
                  placeholder="Rechercher l'adresse du bien..."
                />
              </div>

              {/* Affichage des coordonnées (lecture seule) */}
              {formData.localization[0] !== 0 &&
                formData.localization[1] !== 0 && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <label className='block text-sm font-medium text-gray-500'>
                        Longitude
                      </label>
                      <input
                        type='text'
                        value={formData.localization[0].toFixed(6)}
                        readOnly
                        className='w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label className='block text-sm font-medium text-gray-500'>
                        Latitude
                      </label>
                      <input
                        type='text'
                        value={formData.localization[1].toFixed(6)}
                        readOnly
                        className='w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600'
                      />
                    </div>
                  </div>
                )}

              {/* Informations d'adresse détaillées */}
              {formData.city && (
                <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
                  <h4 className='text-sm font-medium text-orange-800 mb-2'>
                    Adresse détectée :
                  </h4>
                  <div className='text-sm text-orange-700 space-y-1'>
                    {formData.city && (
                      <div>
                        <strong>Ville :</strong> {formData.city}
                      </div>
                    )}
                    {formData.state && (
                      <div>
                        <strong>Région :</strong> {formData.state}
                      </div>
                    )}
                    {formData.country && (
                      <div>
                        <strong>Pays :</strong> {formData.country}
                      </div>
                    )}
                    {formData.zip && (
                      <div>
                        <strong>Code postal :</strong> {formData.zip}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Upload de médias */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Photos
              </label>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition-colors duration-200'>
                <input
                  type='file'
                  multiple
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
                      PNG, JPG jusqu'à 10MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Prévisualisation des images */}
              {formData.medias.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-sm text-gray-500'>
                    Cliquez sur l'image principale
                  </p>
                  <div className='grid grid-cols-6 gap-2'>
                    {formData.medias.map((image, index) => (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                          index === 0 ? 'ring-2 ring-orange-500' : ''
                        }`}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`preview-${index}`}
                          className='w-full h-full object-cover'
                          onClick={() => handlePriorityChange(index)}
                        />
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

            {/* Prix et période */}
            <div
              className={`grid gap-4 ${selectedAdType?.key === 'location' ? 'grid-cols-2' : 'grid-cols-1'}`}
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
    <div className='fixed z-50 inset-0 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen p-4 text-center'>
        <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
          <div className='absolute inset-0 bg-gray-500 opacity-75'></div>
        </div>

        <div className='relative w-full max-w-4xl h-[80vh] bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all'>
          <div className='bg-white h-full px-8 pt-6 pb-8 flex flex-col'>
            <div className='flex justify-between items-center mb-2'>
              <div>
                <h3 className='text-2xl font-semibold text-gray-900'>
                  Créer une annonce
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  Partagez votre bien en quelques étapes
                </p>
              </div>
              <button
                onClick={toggleDialog}
                className='rounded-full p-2 hover:bg-gray-100 transition-colors duration-200'
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
              className='mt-4 flex flex-1 flex-col min-h-0'
            >
              <div className='flex flex-1 min-h-0 gap-8'>
                {/* Stepper vertical à gauche */}
                <div className='w-64 flex-shrink-0'>{renderSteppers()}</div>

                {/* Contenu principal à droite */}
                <div className='flex-1'>
                  <div className='h-full overflow-y-auto px-1'>
                    <div className='space-y-6'>{renderStepContent()}</div>
                  </div>
                </div>
              </div>

              <div className='mt-8 flex justify-between items-center pt-6 border-t border-gray-100'>
                {currentStep > 1 ? (
                  <button
                    type='button'
                    onClick={() => setCurrentStep(step => step - 1)}
                    className='px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200'
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
                        alert('Veuillez ajouter au moins une photo');
                        return;
                      }
                      setCurrentStep(step => step + 1);
                    }}
                    className='px-8 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md'
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    type='submit'
                    disabled={
                      !formData.price ||
                      !formData.description ||
                      formData.medias.length === 0 ||
                      (selectedAdType?.key === 'location' && !selectedPeriod)
                    }
                    className='px-8 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    🚀 Publier
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
