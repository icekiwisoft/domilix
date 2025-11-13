import api from './api';

export interface Subscription {
  id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  plan_name: string;
  credits: number;
  price: number;
  duration: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionRequest {
  payment_info: {
    amount: number;
    currency?: string;
    phone_number?: string;
    email?: string;
  };
  plan_name: string;
  method: 'campay' | 'orange_money' | 'mtn_money';
}

export const subscriptionApi = {
  // Récupérer les abonnements de l'utilisateur connecté
  getUserSubscriptions: async (): Promise<Subscription[]> => {
    const response = await api.get('/subscriptions');
    return response.data;
  },

  // Récupérer un abonnement spécifique
  getSubscription: async (id: number): Promise<Subscription> => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  // Créer un nouvel abonnement (souscrire à un plan)
  createSubscription: async (data: CreateSubscriptionRequest): Promise<any> => {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },

  // Annuler un abonnement (soft delete)
  cancelSubscription: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },

  // Fonction pour démarrer l'achat de crédits
  startCreditPurchase: async (
    plan_name: string,
    payment_info: any,
    method: string
  ): Promise<any> => {
    try {
      const response = await api.post('/subscriptions', {
        plan_name: plan_name,
        payment_info: payment_info,
        method: method,
      });

      console.log(
        'Credit purchase initiated, follow mobile payment instructions',
        response
      );
      return response.data;
    } catch (error) {
      console.error('Credit purchase error:', error);
      throw error;
    }
  },

  // Calculer les statistiques d'utilisation basées sur les abonnements
  getUsageStats: async (): Promise<{
    total_credits: number;
    used_credits: number;
    remaining_credits: number;
    active_subscriptions: number;
  }> => {
    try {
      const subscriptions = await subscriptionApi.getUserSubscriptions();

      const now = new Date();
      const activeSubscriptions = subscriptions.filter(
        sub => new Date(sub.expires_at) > now && sub.credits > 0
      );

      // Calculer les statistiques basées sur les données réelles
      const totalCredits = subscriptions.reduce((sum, sub) => {
        // Supposer que les crédits initiaux étaient stockés ou calculés
        return sum + sub.credits;
      }, 0);

      const remainingCredits = activeSubscriptions.reduce(
        (sum, sub) => sum + sub.credits,
        0
      );
      const usedCredits = Math.max(0, totalCredits - remainingCredits);

      return {
        total_credits: totalCredits,
        used_credits: usedCredits,
        remaining_credits: remainingCredits,
        active_subscriptions: activeSubscriptions.length,
      };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return {
        total_credits: 0,
        used_credits: 0,
        remaining_credits: 0,
        active_subscriptions: 0,
      };
    }
  },

  // Vérifier si l'utilisateur a des crédits disponibles
  hasAvailableCredits: async (): Promise<boolean> => {
    const stats = await subscriptionApi.getUsageStats();
    return stats.remaining_credits > 0;
  },

  // Obtenir le statut d'un abonnement
  getSubscriptionStatus: (
    subscription: Subscription
  ): 'active' | 'expired' | 'low_credits' => {
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);

    if (expiresAt <= now) {
      return 'expired';
    }

    if (subscription.credits <= 5) {
      return 'low_credits';
    }

    return 'active';
  },
};
