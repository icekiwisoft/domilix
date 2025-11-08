import { useState, useEffect } from 'react';
import { getStoreValue, setStoreValue } from 'pulsy';
import usePulsy from 'pulsy';
import {
  authApi,
  LoginCredentials,
  RegisterData,
  User,
} from '../services/authApi';

export const useAuth = () => {
  const [token, setToken] = usePulsy<string | null>('token');
  const [user, setUser] = usePulsy<User | null>('user');
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoreValue<string | null>('token');
      if (storedToken && !user) {
        try {
          setIsLoading(true);
          const response = await authApi.getProfile();
          setStoreValue('user', response.user);
        } catch (error) {
          // Token might be invalid, clear it
          setStoreValue('token', null);
          setStoreValue('user', null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);

      setToken(response.authorisation.token);
      setUser(response.user);
      console.log('Login successful:', response);

      // Sync with existing auth system
      setStoreValue('authData', {
        status: 'logged',
        user: response.user,
      });

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
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);

      setStoreValue('token', response.authorisation.token);
      setStoreValue('user', response.user);

      // Sync with existing auth system
      setStoreValue('authData', {
        status: 'logged',
        user: response.user,
      });

      return { success: true, data: response };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      setStoreValue('token', null);
      setStoreValue('user', null);

      // Sync with existing auth system
      setStoreValue('authData', {
        status: 'guess',
        user: null,
      });

      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authApi.getProfile();
      setStoreValue('user', response.user);
      return response.user;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  const authenticate = async () => {
    const storedToken = getStoreValue<string | null>('token');

    if (!storedToken) {
      // Sync with existing auth system
      setStoreValue('authData', {
        status: 'guess',
        user: null,
      });
      return false;
    }

    try {
      setIsLoading(true);
      const response = await authApi.getProfile();
      setStoreValue('user', response.user);

      // Sync with existing auth system
      setStoreValue('authData', {
        status: 'logged',
        user: response.user,
      });

      return true;
    } catch (error) {
      // Token is invalid, clear it
      setStoreValue('token', null);
      setStoreValue('user', null);

      // Sync with existing auth system
      setStoreValue('authData', {
        status: 'guess',
        user: null,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhone = async (verificationCode: string) => {
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
  };

  const resendVerificationCode = async () => {
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
  };

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
