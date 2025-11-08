import api from './api';

export interface UpdateProfileData {
  name: string;
  email: string;
  phone_number: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface BecomeAnnouncerData {
  company_name?: string;
  bio?: string;
  professional_phone?: string;
}

export const profileApi = {
  // Update user profile
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData) => {
    const response = await api.post('/auth/changePassword', data);
    return response.data;
  },

  // Request to become announcer
  becomeAnnouncer: async () => {
    const response = await api.post('/announcer-requests');
    return response.data;
  },

  // Update announcer profile
  updateAnnouncerProfile: async (data: BecomeAnnouncerData) => {
    const response = await api.put('/auth/announcer-profile', data);
    return response.data;
  },
};
