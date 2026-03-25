'use client';

import { useCallback, useState } from 'react';
import {
  authApi,
  LoginCredentials,
  RegisterData,
  User,
} from '../services/authApi';
import {
  clearAuthState,
  getAuthToken,
  setAuthChecked,
  setAuthToken,
  setAuthUser,
  useAuthStore,
} from '@stores/defineStore';

export const useAuth = () => {
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user as User | null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);

      setAuthToken(response.authorisation.token);
      setAuthUser(response.user);
      setAuthChecked(true);

      return { success: true, data: response };
    } catch (error: any) {
      console.warn(error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);

      setAuthToken(response.authorisation.token);
      setAuthUser(response.user);
      setAuthChecked(true);

      return { success: true, data: response };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      clearAuthState();

      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      setAuthUser(response.user);
      setAuthChecked(true);
      return response.user;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  }, []);

  const authenticate = useCallback(async () => {
    const storedToken = getAuthToken();

    if (!storedToken) {
      clearAuthState();
      return false;
    }

    try {
      setIsLoading(true);
      const response = await authApi.getProfile();
      setAuthUser(response.user);
      setAuthChecked(true);

      return true;
    } catch (error) {
      clearAuthState();

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyPhone = useCallback(async (verificationCode: string) => {
    if (!user) throw new Error('No user found');

    try {
      setIsLoading(true);
      const response = await authApi.verifyPhone(user.id, verificationCode);

      // Refresh user data to get updated phone_verified status
      await refreshProfile();

      return { success: true, message: response.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Phone verification failed',
      };
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile, user]);

  const resendVerificationCode = useCallback(async () => {
    if (!user) throw new Error('No user found');

    try {
      setIsLoading(true);
      const response = await authApi.resendVerificationCode(user.id);
      return { success: true, message: response.message };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || 'Failed to resend verification code',
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    authenticate,
    refreshProfile,
    verifyPhone,
    resendVerificationCode,
  };
};
