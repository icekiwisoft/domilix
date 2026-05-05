'use client';

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { HiCamera } from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { profileApi } from '../../services/profileApi';
import {
  subscriptionApi,
  type Subscription,
} from '../../services/subscriptionApi';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'modal' | 'page';
  initialTab?: TabType;
}

type TabType = 'profile' | 'security' | 'announcer' | 'subscriptions';

export default function ProfileDialog({
  isOpen,
  onClose,
  variant = 'modal',
  initialTab = 'profile',
}: ProfileDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [announcerForm, setAnnouncerForm] = useState({
    company_name: '',
    bio: '',
    professional_phone: '',
    avatar: null as File | null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Packs state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  // Load packs when tab is active
  useEffect(() => {
    if (activeTab === 'subscriptions' && isOpen) {
      loadSubscriptions();
    }
  }, [activeTab, isOpen]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadSubscriptions = async () => {
    setSubscriptionsLoading(true);
    try {
      const subscriptions = await subscriptionApi.getUserSubscriptions();
      setSubscriptions(subscriptions);
    } catch (error) {
      console.error('Erreur lors du chargement des packs:', error);
      setSubscriptions([]);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnnouncerForm({ ...announcerForm, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelSubscription = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce pack ?')) return;

    try {
      await subscriptionApi.cancelSubscription(id);
      await loadSubscriptions();
      alert('Pack annulé avec succès');
    } catch (error) {
      alert("Erreur lors de l'annulation du pack");
    }
  };

  const handleRenewSubscription = async (id: number) => {
    // Pour le renouvellement, on redirige vers la page des packs
    try {
      onClose();
      window.location.href = '/subscriptions';
    } catch (error) {
      alert('Erreur lors du renouvellement du pack');
    }
  };

  if (!isOpen && variant === 'modal') return null;

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await profileApi.updateProfile(profileForm);
      await refreshProfile();
      alert('Profil mis à jour avec succès');
    } catch (error) {
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await profileApi.changePassword(passwordForm);
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      alert('Mot de passe changé avec succès');
    } catch (error) {
      alert('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeAnnouncer = async () => {
    setLoading(true);
    try {
      await profileApi.becomeAnnouncer();
      await refreshProfile();
      alert('Demande envoyée avec succès');
    } catch (error) {
      alert('Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnnouncerProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Ajouter _method pour Laravel
      formData.append('_method', 'PUT');
      
      if (announcerForm.company_name)
        formData.append('company_name', announcerForm.company_name);
      if (announcerForm.bio) formData.append('bio', announcerForm.bio);
      if (announcerForm.professional_phone)
        formData.append('professional_phone', announcerForm.professional_phone);
      if (announcerForm.avatar) formData.append('avatar', announcerForm.avatar);

      await profileApi.updateAnnouncerProfile(formData);
      await refreshProfile();
      alert('Profil annonceur mis à jour avec succès');
      setAvatarPreview(null);
    } catch (error) {
      console.error('Erreur mise à jour profil annonceur:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as TabType, name: 'Profil' },
    { id: 'security' as TabType, name: 'Sécurité' },
    { id: 'announcer' as TabType, name: 'Annonceur' },
    { id: 'subscriptions' as TabType, name: 'Mes packs' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nom complet
                </label>
                <input
                  type='text'
                  value={profileForm.name}
                  onChange={e =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  value={profileForm.email}
                  onChange={e =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Téléphone
                </label>
                <input
                  type='tel'
                  value={profileForm.phone_number}
                  onChange={e =>
                    setProfileForm({
                      ...profileForm,
                      phone_number: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                />
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className='w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium py-2 px-4 rounded-lg transition-colors'
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </button>
          </div>
        );

      case 'security':
        return (
          <div className='space-y-6'>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='font-medium text-gray-900 mb-2'>
                Statut de vérification
              </h4>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Email</span>
                  <span className='text-sm font-medium text-red-600'>
                    Non vérifié
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Téléphone</span>
                  <span
                    className={`text-sm font-medium ${user?.phone_verified ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {user?.phone_verified ? 'Vérifié' : 'Non vérifié'}
                  </span>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Mot de passe actuel
                </label>
                <input
                  type='password'
                  value={passwordForm.current_password}
                  onChange={e =>
                    setPasswordForm({
                      ...passwordForm,
                      current_password: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nouveau mot de passe
                </label>
                <input
                  type='password'
                  value={passwordForm.new_password}
                  onChange={e =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type='password'
                  value={passwordForm.new_password_confirmation}
                  onChange={e =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password_confirmation: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className='w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium py-2 px-4 rounded-lg transition-colors'
              >
                {loading ? 'Changement...' : 'Changer le mot de passe'}
              </button>
            </div>
          </div>
        );

      case 'announcer':
        return (
          <div className='space-y-6'>
            {!user?.announcer ? (
              <div className='text-center py-8'>
                <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <BuildingOfficeIcon className='w-8 h-8 text-orange-600' />
                </div>
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  Devenir Annonceur
                </h4>
                <p className='text-gray-600 mb-6'>
                  Rejoignez notre communauté d'annonceurs et commencez à publier
                  vos annonces.
                </p>
                <button
                  onClick={handleBecomeAnnouncer}
                  disabled={loading}
                  className='bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium py-3 px-6 rounded-lg transition-colors'
                >
                  {loading
                    ? 'Demande en cours...'
                    : 'Demander à devenir annonceur'}
                </button>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm font-medium text-green-800'>
                      Compte annonceur actif
                    </span>
                  </div>
                  <p className='text-sm text-green-700'>
                    Vous pouvez maintenant publier des annonces et gérer votre
                    profil d'annonceur.
                  </p>
                </div>

                {/* Avatar Upload */}
                <div className='flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                  <div className='relative'>
                    <div className='w-24 h-24 rounded-full bg-gray-200 overflow-hidden'>
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt='Avatar'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <BuildingOfficeIcon className='w-12 h-12 text-gray-400' />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor='avatar-upload'
                      className='absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors'
                    >
                      <HiCamera className='w-4 h-4' />
                      <input
                        id='avatar-upload'
                        type='file'
                        accept='image/*'
                        onChange={handleAvatarChange}
                        className='hidden'
                      />
                    </label>
                  </div>
                  <p className='text-xs text-gray-500 text-center'>
                    Cliquez sur l'icône pour changer votre avatar
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Nom de l'entreprise
                    </label>
                    <input
                      type='text'
                      value={announcerForm.company_name}
                      onChange={e =>
                        setAnnouncerForm({
                          ...announcerForm,
                          company_name: e.target.value,
                        })
                      }
                      placeholder='Nom de votre entreprise'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Biographie
                    </label>
                    <textarea
                      rows={3}
                      value={announcerForm.bio}
                      onChange={e =>
                        setAnnouncerForm({
                          ...announcerForm,
                          bio: e.target.value,
                        })
                      }
                      placeholder='Décrivez votre activité...'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Contact professionnel
                    </label>
                    <input
                      type='tel'
                      value={announcerForm.professional_phone}
                      onChange={e =>
                        setAnnouncerForm({
                          ...announcerForm,
                          professional_phone: e.target.value,
                        })
                      }
                      placeholder='Numéro de téléphone professionnel'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateAnnouncerProfile}
                  disabled={loading}
                  className='w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium py-2 px-4 rounded-lg transition-colors'
                >
                  {loading
                    ? 'Mise à jour...'
                    : 'Mettre à jour le profil annonceur'}
                </button>
              </div>
            )}
          </div>
        );

      case 'subscriptions':
        const usableCredits = subscriptions
          .filter(subscription => new Date(subscription.expires_at) > new Date())
          .reduce((sum, subscription) => sum + subscription.credits, 0);

        return (
          <div className='space-y-6'>
            {/* Packs List */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Mes packs
                </h3>
                <button
                  onClick={loadSubscriptions}
                  disabled={subscriptionsLoading}
                  className='text-sm text-orange-600 hover:text-orange-700 disabled:text-gray-400'
                >
                  {subscriptionsLoading ? 'Chargement...' : 'Actualiser'}
                </button>
              </div>

              {!subscriptionsLoading && usableCredits <= 0 && (
                <div className='mb-5 rounded-2xl border border-orange-200 bg-orange-50 p-4'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                      <h4 className='font-black text-orange-900'>Aucun crédit utilisable</h4>
                      <p className='mt-1 text-sm text-orange-800'>
                        Vos packs sont expirés ou ne contiennent plus de crédits. Achetez un nouveau pack pour continuer à débloquer des annonces.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => {
                        window.location.href = '/subscriptions';
                      }}
                      className='shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-orange-600'
                    >
                      Acheter un pack
                    </button>
                  </div>
                </div>
              )}

              {subscriptionsLoading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto'></div>
                  <p className='text-gray-600 mt-2'>
                    Chargement des packs...
                  </p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <DocumentTextIcon className='w-8 h-8 text-gray-400' />
                  </div>
                  <h4 className='text-lg font-medium text-gray-900 mb-2'>
                    Aucun pack
                  </h4>
                  <p className='text-gray-600 mb-4'>
                    Vous n'avez pas encore de pack actif.
                  </p>
                  <button
                    onClick={onClose}
                    className='bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
                  >
                    Voir les offres
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {subscriptions.map(subscription => (
                    <div
                      key={subscription.id}
                      className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-2'>
                            <h4 className='font-medium text-gray-900'>
                              {subscription.plan_name}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                subscriptionApi.getSubscriptionStatus(
                                  subscription
                                ) === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : subscriptionApi.getSubscriptionStatus(
                                        subscription
                                      ) === 'expired'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {subscriptionApi.getSubscriptionStatus(
                                subscription
                              ) === 'active'
                                ? 'Actif'
                                : subscriptionApi.getSubscriptionStatus(
                                      subscription
                                    ) === 'expired'
                                  ? 'Expiré'
                                  : 'Crédits faibles'}
                            </span>
                          </div>

                          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600'>
                            <div>
                              <span className='font-medium'>Crédits:</span>
                              <div>{subscription.credits}</div>
                            </div>
                            <div>
                              <span className='font-medium'>Prix:</span>
                              <div>
                                {subscription.price.toLocaleString()} FCFA
                              </div>
                            </div>
                            <div>
                              <span className='font-medium'>Début:</span>
                              <div>
                                {new Date(
                                  subscription.start_date
                                ).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                            <div>
                              <span className='font-medium'>Fin:</span>
                              <div>
                                {new Date(
                                  subscription.end_date
                                ).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='flex gap-2 ml-4'>
                          {subscriptionApi.getSubscriptionStatus(
                            subscription
                          ) === 'active' && (
                            <button
                              onClick={() =>
                                handleCancelSubscription(subscription.id)
                              }
                              className='text-sm text-red-600 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors'
                            >
                              Annuler
                            </button>
                          )}
                          {subscriptionApi.getSubscriptionStatus(
                            subscription
                          ) === 'expired' && (
                            <button
                              onClick={() =>
                                handleRenewSubscription(subscription.id)
                              }
                              className='text-sm text-orange-600 hover:text-orange-700 px-3 py-1 border border-orange-200 rounded hover:bg-orange-50 transition-colors'
                            >
                              Renouveler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const settingsPanel = (
    <div
      className={
        variant === 'page'
          ? 'grid w-full grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]'
          : 'relative flex h-[760px] max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-white/20'
      }
    >
      <aside
        className={
          variant === 'page'
            ? 'rounded-3xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm lg:sticky lg:top-24 lg:h-fit'
            : 'hidden w-64 flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-6 text-white md:flex'
        }
      >
            <div className='mb-8'>
              <div
                className={
                  variant === 'page'
                    ? 'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-xl font-black text-orange-600'
                    : 'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black shadow-inner ring-1 ring-white/10'
                }
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h2 className='text-lg font-black'>{user?.name || 'Utilisateur'}</h2>
              <p className={variant === 'page' ? 'mt-1 break-all text-sm text-gray-500' : 'mt-1 break-all text-sm text-white/60'}>{user?.email}</p>
            </div>

            <nav className='space-y-2'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    variant === 'page'
                      ? `w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
                          activeTab === tab.id
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      : `w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all ${
                          activeTab === tab.id
                            ? 'bg-white text-slate-950 shadow-xl'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`
                  }
                >
                  {tab.name}
                </button>
              ))}
            </nav>

            <div className={variant === 'page' ? 'mt-6 rounded-2xl bg-gray-50 p-4 text-gray-600' : 'mt-auto rounded-2xl bg-white/10 p-4 ring-1 ring-white/10'}>
              <p className={variant === 'page' ? 'text-xs font-bold uppercase tracking-widest text-orange-600' : 'text-xs font-bold uppercase tracking-widest text-orange-200'}>Domilix</p>
              <p className={variant === 'page' ? 'mt-1 text-sm text-gray-500' : 'mt-1 text-sm text-white/70'}>Gérez votre profil, vos accès et vos packs.</p>
            </div>
          </aside>

          <section
            className={
              variant === 'page'
                ? 'min-w-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm'
                : 'flex min-w-0 flex-1 flex-col'
            }
          >
          {/* Header */}
          <div className='flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white/95 p-5 sm:p-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-lg font-black text-white shadow-lg shadow-orange-500/20 md:hidden'>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className='text-xl font-black text-gray-900'>
                  Paramètres
                </h2>
                <p className='text-sm text-gray-500'>
                  {user?.name || 'Utilisateur'}{user?.email ? ` · ${user.email}` : ''}
                </p>
              </div>
            </div>
            {variant === 'modal' && (
              <button
                onClick={onClose}
                className='rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900'
                aria-label='Fermer'
              >
                <XMarkIcon className='h-5 w-5' />
              </button>
            )}
          </div>

          {/* Horizontal Tabs */}
          <div className='flex-shrink-0 border-b border-gray-100 bg-gray-50/80 lg:hidden'>
            <nav className='flex gap-2 overflow-x-auto px-4 py-3'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-white text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className={variant === 'page' ? 'bg-white p-5 sm:p-8' : 'flex-1 overflow-y-auto bg-gradient-to-br from-white to-gray-50 p-5 sm:p-6'}>
            {renderTabContent()}
          </div>
          </section>
        </div>
  );

  if (variant === 'page') {
    return (
      <div className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {settingsPanel}
      </div>
    );
  }

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <button
          type='button'
          className='fixed inset-0 cursor-default'
          onClick={onClose}
          aria-label='Fermer les paramètres'
        />
        {settingsPanel}
      </div>
    </div>
  );
}
