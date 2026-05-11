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
  duration: number | string;
  start_date?: string | null;
  end_date?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionRequest {
  payment_info: string | {
    amount?: number;
    currency?: string;
    phone_number?: string;
    email?: string;
  };
  plan_name: string;
  method: 'orange' | 'mtn' | 'orange_money' | 'mtn_money';
}

const assertPaymentRequestAccepted = (data: any) => {
  if (!data) {
    throw new Error('La demande de paiement n’a pas été acceptée.');
  }

  if (typeof data === 'object') {
    const code = Number(data.code ?? data.statusCode);
    const status = String(data.status ?? '').toLowerCase();
    const message = String(data.message ?? data.error ?? '').toLowerCase();

    if (
      code >= 400 ||
      ['failed', 'failure', 'error', 'cancelled', 'canceled'].includes(status) ||
      message.includes('unsupported') ||
      message.includes('failed') ||
      message.includes('error')
    ) {
      throw new Error('La demande de paiement a été refusée.');
    }
  }
};

const parseDate = (date?: string | null) => {
  if (!date) return null;

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isSubscriptionUsable = (subscription: Subscription) => {
  if (subscription.credits <= 0) return false;

  const now = new Date();
  const endDate = parseDate(subscription.end_date);
  const expiresAt = parseDate(subscription.expires_at);

  if (expiresAt) return expiresAt > now;
  if (endDate) return endDate > now;

  return true;
};

export const subscriptionApi = {
  // Récupérer les packs de l'utilisateur connecté
  getUserSubscriptions: async (): Promise<Subscription[]> => {
    const response = await api.get('/subscriptions');
    return response.data;
  },

  // Récupérer un pack spécifique
  getSubscription: async (id: number): Promise<Subscription> => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  // Créer un nouveau pack
  createSubscription: async (data: CreateSubscriptionRequest): Promise<any> => {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },

  // Annuler un pack (soft delete)
  cancelSubscription: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },

  // Fonction pour démarrer l'achat de Domicoins
  startCreditPurchase: async (
    plan_name: string,
    payment_info: CreateSubscriptionRequest['payment_info'],
    method: CreateSubscriptionRequest['method']
  ): Promise<any> => {
    try {
      const response = await api.post('/subscriptions', {
        plan_name: plan_name,
        payment_info: payment_info,
        method: method,
      });

      assertPaymentRequestAccepted(response.data);
      return response.data;
    } catch (error) {
      console.error('Credit purchase error:', error);
      throw error;
    }
  },

  // Calculer les statistiques d'utilisation basées sur les packs
  getUsageStats: async (): Promise<{
    total_credits: number;
    used_credits: number;
    remaining_credits: number;
    active_subscriptions: number;
  }> => {
    try {
      const subscriptions = await subscriptionApi.getUserSubscriptions();

      const activeSubscriptions = subscriptions.filter(
        sub => isSubscriptionUsable(sub)
      );

      // Calculer les statistiques basées sur les données réelles
      const totalCredits = subscriptions.reduce((sum, sub) => {
        // Supposer que les Domicoins initiaux étaient stockés ou calculés
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

  // Vérifier si l'utilisateur a des Domicoins disponibles
  hasAvailableCredits: async (): Promise<boolean> => {
    const stats = await subscriptionApi.getUsageStats();
    return stats.remaining_credits > 0;
  },

  // Obtenir le statut d'un pack
  getSubscriptionStatus: (
    subscription: Subscription
  ): 'active' | 'expired' | 'low_credits' => {
    const now = new Date();
    const expiresAt = parseDate(subscription.expires_at);
    const endDate = parseDate(subscription.end_date);

    if ((expiresAt && expiresAt <= now) || (!expiresAt && endDate && endDate <= now)) {
      return 'expired';
    }

    if (!isSubscriptionUsable(subscription)) return 'expired';

    if (subscription.credits <= 5) {
      return 'low_credits';
    }

    return 'active';
  },
};
