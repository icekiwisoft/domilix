import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
}

export const notificationApi = {
  // Get all notifications
  getNotifications: async (unreadOnly = false): Promise<Notification[]> => {
    const response = await api.get('/notifications', {
      params: { unread_only: unreadOnly },
    });
    return response.data.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  // Mark as read
  markAsRead: async (id: number): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/mark-all-read');
  },

  // Delete notification
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  // Delete all read
  deleteAllRead: async (): Promise<void> => {
    await api.delete('/notifications/read/all');
  },
};
