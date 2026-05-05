import api from './api';

export const newsletterApi = {
  subscribe: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/newsletters', { email });
    return response.data;
  },
};
