import axios from 'axios';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import { getStoreValue, setStoreValue } from 'pulsy';

export const baseURL = import.meta.env.DEV
  ? 'http://localhost:8000'
  : 'https://api.domilix.com';

const api = axios.create({
  baseURL: baseURL,
});

// Add token to requests and handle token refresh
api.interceptors.request.use(async req => {
  const token = getStoreValue<string | null>('token');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;

    try {
      const user = jwtDecode(token);
      const isExpired = dayjs.unix(user.exp!).diff(dayjs()) < 1;

      if (isExpired) {
        try {
          const response = await axios.post(
            `${baseURL}/api/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const newToken = response.data.authorisation.token;
          setStoreValue('token', newToken);
          req.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          // Token refresh failed, clear token
          setStoreValue('token', null);
          setStoreValue('user', null);
          req.headers.Authorization = null;
        }
      }
    } catch (error) {
      // Invalid token format, clear it
      setStoreValue('token', null);
      setStoreValue('user', null);
      req.headers.Authorization = null;
    }
  }

  return req;
});

export default api;
