'use client';

import { AuthData, MessageDialog } from '@utils/types';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserState = any | null;

const createSafeStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }

  return window.localStorage;
};

type AuthStore = {
  token: string | null;
  user: UserState;
  authData: AuthData;
  hasHydrated: boolean;
  authChecked: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: UserState | ((prev: UserState) => UserState)) => void;
  setAuthData: (authData: AuthData) => void;
  setHasHydrated: (value: boolean) => void;
  setAuthChecked: (value: boolean) => void;
  syncAuthFromToken: (token: string | null, fallbackUser?: UserState) => void;
  clearAuth: () => void;
};

type UiStore = {
  signinModal: boolean;
  message: MessageDialog | null;
  theme: string;
  setSigninModal: (value: boolean) => void;
  toggleSigninModal: () => void;
  setMessage: (message: MessageDialog | null) => void;
  setTheme: (theme: string) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      authData: {
        status: 'unknow',
        user: null,
      },
      hasHydrated: false,
      authChecked: false,
      setToken: token => {
        set({ token });
        get().syncAuthFromToken(token, get().user);
      },
      setUser: user => {
        set(state => ({
          user: typeof user === 'function' ? user(state.user) : user,
        }));

        const nextUser = get().user;
        set({
          authData: {
            status: nextUser && get().token ? 'logged' : 'guess',
            user: nextUser,
          },
        });
      },
      setAuthData: authData => set({ authData }),
      setHasHydrated: hasHydrated => set({ hasHydrated }),
      setAuthChecked: authChecked => set({ authChecked }),
      syncAuthFromToken: (token, fallbackUser) => {
        if (!token) {
          set({
            token: null,
            user: null,
            authData: {
              status: 'guess',
              user: null,
            },
          });
          return;
        }

        try {
          const decoded = jwtDecode(token);
          set({
            authData: {
              status: 'logged',
              user: fallbackUser || decoded,
            },
          });
        } catch {
          set({
            token: null,
            user: null,
            authData: {
              status: 'guess',
              user: null,
            },
          });
        }
      },
      clearAuth: () =>
        set({
          token: null,
          user: null,
          authChecked: true,
          authData: {
            status: 'guess',
            user: null,
          },
        }),
    }),
    {
      name: 'domilix-auth-store',
      storage: createJSONStorage(createSafeStorage),
      partialize: state => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.syncAuthFromToken(state.token, state.user);
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

export const useUiStore = create<UiStore>()(
  persist(
    set => ({
      signinModal: false,
      message: null,
      theme: 'ligth',
      setSigninModal: signinModal => set({ signinModal }),
      toggleSigninModal: () => set(state => ({ signinModal: !state.signinModal })),
      setMessage: message => set({ message }),
      setTheme: theme => set({ theme }),
    }),
    {
      name: 'domilix-ui-store',
      storage: createJSONStorage(createSafeStorage),
      partialize: state => ({
        theme: state.theme,
      }),
    },
  ),
);

export const signinDialogActions = {
  toggle: () => useUiStore.getState().toggleSigninModal(),
};

export const authDataActions = {
  authenticate: () => {
    const { token, user, syncAuthFromToken, authData } = useAuthStore.getState();
    syncAuthFromToken(token, user);
    return authData;
  },
};

export const getAuthToken = () => useAuthStore.getState().token;
export const setAuthToken = (token: string | null) =>
  useAuthStore.getState().setToken(token);
export const getAuthUser = () => useAuthStore.getState().user;
export const setAuthUser = (user: UserState | ((prev: UserState) => UserState)) =>
  useAuthStore.getState().setUser(user);
export const clearAuthState = () => useAuthStore.getState().clearAuth();
export const setAuthChecked = (value: boolean) =>
  useAuthStore.getState().setAuthChecked(value);
