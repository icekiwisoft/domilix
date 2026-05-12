import api from './api';

export const newsletterApi = {
  subscribe: async (email: string, website = ''): Promise<{ message: string }> => {
    const response = await api.post('/newsletters', { email, website });
    return response.data;
  },
};
