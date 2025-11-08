import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { profileApi } from '../../services/profileApi';
import {
  subscriptionApi,
  type Subscription,
} from '../../services/subscriptionApi';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'security' | 'announcer' | 'subscriptions';

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
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
  });

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [usageStats, setUsageStats] = useState({
    total_credits: 0,
    used_credits: 0,
    remaining_credits: 0,
    active_subscriptions: 0,
  });

  // Load subscriptions when tab is active
  useEffect(() => {
    if (activeTab === 'subscriptions' && isOpen) {
      loadSubscriptions();
      loadUsageStats();
    }
  }, [activeTab, isOpen]);

  const loadSubscriptions = async () => {
    setSubscriptionsLoading(true);
    try {
      const subscriptions = await subscriptionApi.getUserSubscriptions();
      setSubscriptions(subscriptions);
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error);
      setSubscriptions([]);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const stats = await subscriptionApi.getUsageStats();
      setUsageStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleCancelSubscription = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) return;

    try {
      await subscriptionApi.cancelSubscription(id);
      await loadSubscriptions();
      alert('Abonnement annulé avec succès');
    } catch (error) {
      alert("Erreur lors de l'annulation de l'abonnement");
    }
  };

  const handleRenewSubscription = async (id: number) => {
    // Pour le renouvellement, on redirige vers la page des abonnements
    try {
      onClose();
      window.location.href = '/subscriptions';
    } catch (error) {
      alert("Erreur lors du renouvellement de l'abonnement");
    }
  };

  if (!isOpen) return null;

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
      await profileApi.updateAnnouncerProfile(announcerForm);
      await refreshProfile();
      alert('Profil annonceur mis à jour avec succès');
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as TabType, name: 'Profil' },
    { id: 'security' as TabType, name: 'Sécurité' },
    { id: 'announcer' as TabType, name: 'Annonceur' },
    { id: 'subscriptions' as TabType, name: 'Mes abonnements' },
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors'
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
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-2xl'>🏢</span>
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
                  className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-lg transition-colors'
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
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Biographie
                    </label>
                    <textarea
                      rows={4}
                      value={announcerForm.bio}
                      onChange={e =>
                        setAnnouncerForm({
                          ...announcerForm,
                          bio: e.target.value,
                        })
                      }
                      placeholder='Décrivez votre activité...'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateAnnouncerProfile}
                  disabled={loading}
                  className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors'
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
        return (
          <div className='space-y-6'>
            {/* Usage Stats */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='text-2xl font-bold text-blue-600'>
                  {usageStats.total_credits}
                </div>
                <div className='text-sm text-blue-700'>Crédits totaux</div>
              </div>
              <div className='bg-green-50 p-4 rounded-lg'>
                <div className='text-2xl font-bold text-green-600'>
                  {usageStats.remaining_credits}
                </div>
                <div className='text-sm text-green-700'>Crédits restants</div>
              </div>
              <div className='bg-orange-50 p-4 rounded-lg'>
                <div className='text-2xl font-bold text-orange-600'>
                  {usageStats.used_credits}
                </div>
                <div className='text-sm text-orange-700'>Crédits utilisés</div>
              </div>
              <div className='bg-purple-50 p-4 rounded-lg'>
                <div className='text-2xl font-bold text-purple-600'>
                  {usageStats.active_subscriptions}
                </div>
                <div className='text-sm text-purple-700'>
                  Abonnements actifs
                </div>
              </div>
            </div>

            {/* Subscriptions List */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Mes abonnements
                </h3>
                <button
                  onClick={loadSubscriptions}
                  disabled={subscriptionsLoading}
                  className='text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400'
                >
                  {subscriptionsLoading ? 'Chargement...' : 'Actualiser'}
                </button>
              </div>

              {subscriptionsLoading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                  <p className='text-gray-600 mt-2'>
                    Chargement des abonnements...
                  </p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <span className='text-2xl'>📋</span>
                  </div>
                  <h4 className='text-lg font-medium text-gray-900 mb-2'>
                    Aucun abonnement
                  </h4>
                  <p className='text-gray-600 mb-4'>
                    Vous n'avez pas encore d'abonnement actif.
                  </p>
                  <button
                    onClick={onClose}
                    className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
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
                              className='text-sm text-blue-600 hover:text-blue-700 px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors'
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

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm'
          onClick={onClose}
        ></div>

        <div className='relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold'>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>
                  {user?.name || 'Utilisateur'}
                </h2>
                <p className='text-sm text-gray-600'>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <XMarkIcon className='w-5 h-5 text-gray-400' />
            </button>
          </div>

          {/* Horizontal Tabs */}
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
