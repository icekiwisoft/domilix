import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiXCircle,
  HiX,
  HiCheck,
} from 'react-icons/hi';
import { notificationApi, type Notification } from '../../services/notificationApi';
import { useNavigate } from 'react-router-dom';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPopup({
  isOpen,
  onClose,
}: NotificationPopupProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className='w-5 h-5 text-green-500' />;
      case 'error':
        return <HiXCircle className='w-5 h-5 text-red-500' />;
      case 'warning':
        return <HiExclamationCircle className='w-5 h-5 text-orange-500' />;
      default:
        return <HiInformationCircle className='w-5 h-5 text-blue-500' />;
    }
  };

  const getBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-orange-50';
      default:
        return 'bg-blue-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className='absolute right-0 mt-2 w-96 max-w-[95vw] bg-white border rounded-xl shadow-xl z-[60] max-h-[80vh] flex flex-col'
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold text-gray-900'>Notifications</h3>
            {unreadCount > 0 && (
              <span className='bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full'>
                {unreadCount}
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className='text-xs text-orange-600 hover:text-orange-700 font-medium'
              >
                Tout marquer comme lu
              </button>
            )}
            <button
              onClick={onClose}
              className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <HiX className='w-5 h-5 text-gray-400' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='overflow-y-auto flex-1'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600'></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 px-4'>
              <HiInformationCircle className='w-12 h-12 text-gray-300 mb-3' />
              <p className='text-gray-500 text-sm'>Aucune notification</p>
            </div>
          ) : (
            <div className='divide-y'>
              {notifications.map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${getBgColor(notification.type, notification.read)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className='flex gap-3'>
                    <div className='flex-shrink-0 mt-0.5'>
                      {getIcon(notification.type)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <h4
                          className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}
                        >
                          {notification.title}
                        </h4>
                        <div className='flex items-center gap-1 flex-shrink-0'>
                          {!notification.read && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className='p-1 hover:bg-white rounded transition-colors'
                              title='Marquer comme lu'
                            >
                              <HiCheck className='w-4 h-4 text-gray-400 hover:text-green-600' />
                            </button>
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            className='p-1 hover:bg-white rounded transition-colors'
                            title='Supprimer'
                          >
                            <HiX className='w-4 h-4 text-gray-400 hover:text-red-600' />
                          </button>
                        </div>
                      </div>
                      <p
                        className={`text-xs mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}
                      >
                        {notification.message}
                      </p>
                      <p className='text-xs text-gray-400 mt-2'>
                        {new Date(notification.created_at).toLocaleDateString(
                          'fr-FR',
                          {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
