import api from './api';

export const newsletterApi = {
  subscribe: async (email: string, website = ''): Promise<{ message: string }> => {
    const response = await api.post('/newsletters', { email, website });
    return response.data;
  },
  unsubscribe: async (clientId: string): Promise<{ message: string }> => {
    const response = await api.get(`/newsletter/${clientId}/unsubscribe`);
    return response.data;
  },
};
