import { Announcer } from '../utils/types';
import api from './api';

// Get announcer by ID
export const getAnnouncer = async (id: string): Promise<Announcer> => {
  const response = await api.get(`announcers/${id}`);
  return response.data;
};

// Get all announcers
export const getAnnouncers = async (
  params?: Record<string, any>
): Promise<Announcer[]> => {
  const response = await api.get('announcers', {
    params,
  });
  return response.data;
};
