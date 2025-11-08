import api from './api';

export interface LoginCredentials {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email?: string;
  phone_number: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message?: string;
  user: any;
  authorisation: {
    token: string;
    type: string;
  };
}

export interface User {
  id: number;
  name: string;
  email?: string;
  phone_number: string;
  phone_verified: boolean;
  announcer?: string | null;
  created_at: string;
  updated_at: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async (): Promise<{ status: string; user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  verifyPhone: async (
    userId: number,
    verificationCode: string
  ): Promise<{ message: string }> => {
    const response = await api.post(`/auth/verifyPhone/${userId}`, {
      verification_code: verificationCode,
    });
    return response.data;
  },

  resendVerificationCode: async (
    userId: number
  ): Promise<{ message: string }> => {
    const response = await api.post(`/auth/resendVerificationCode/${userId}`);
    return response.data;
  },
};
