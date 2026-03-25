import axios from 'axios';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import { clearAuthState, getAuthToken, setAuthToken } from '@stores/defineStore';

let refreshPromise: Promise<string | null> | null = null;

export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://api.domilix.com');

const api = axios.create({
  baseURL: baseURL,
});

const refreshAccessToken = async (token: string) => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${baseURL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then(response => {
        const newToken = response.data.authorisation.token as string;
        setAuthToken(newToken);
        return newToken;
      })
      .catch(() => {
        clearAuthState();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Add token to requests and handle token refresh
api.interceptors.request.use(async req => {
  const token = getAuthToken();

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;

    try {
      const user = jwtDecode(token);
      const isExpired = dayjs.unix(user.exp!).diff(dayjs()) < 1;

      if (isExpired) {
        const newToken = await refreshAccessToken(token);
        if (newToken) {
          req.headers.Authorization = `Bearer ${newToken}`;
        } else {
          clearAuthState();
          req.headers.Authorization = null;
        }
      }
    } catch (error) {
      clearAuthState();
      req.headers.Authorization = null;
    }
  }

  return req;
});

export default api;
