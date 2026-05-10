'use client';

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
import { useNavigate } from '@router';

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
        return <HiCheckCircle className='w-5 h-5' />;
      case 'error':
        return <HiXCircle className='w-5 h-5' />;
      case 'warning':
        return <HiExclamationCircle className='w-5 h-5' />;
      default:
        return <HiInformationCircle className='w-5 h-5' />;
    }
  };

  const getTypeStyles = (type: Notification['type'], read: boolean) => {
    const opacity = read ? 'opacity-40' : '';
    switch (type) {
      case 'success':
        return { icon: `text-emerald-600 bg-emerald-50 ${opacity}`, dot: 'bg-emerald-500' };
      case 'error':
        return { icon: `text-red-600 bg-red-50 ${opacity}`, dot: 'bg-red-500' };
      case 'warning':
        return { icon: `text-orange-600 bg-orange-50 ${opacity}`, dot: 'bg-orange-500' };
      default:
        return { icon: `text-blue-600 bg-blue-50 ${opacity}`, dot: 'bg-blue-500' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className='absolute right-0 mt-2 w-96 max-w-[95vw] overflow-hidden rounded-2xl border border-[#eee0d2] bg-white shadow-2xl shadow-slate-900/10 z-[60] max-h-[80vh] flex flex-col'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-[#eee0d2] bg-white'>
          <div className='flex items-center gap-2.5'>
            <h3 className='font-black text-gray-950 text-base'>Notifications</h3>
            {unreadCount > 0 && (
              <span className='inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-[#E8921A] px-1.5 text-[11px] font-black text-white'>
                {unreadCount}
              </span>
            )}
          </div>
          <div className='flex items-center gap-1'>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className='rounded-full px-3 py-1.5 text-xs font-bold text-[#E8921A] transition hover:bg-orange-50'
              >
                Tout lire
              </button>
            )}
            <button
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700'
            >
              <HiX className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='overflow-y-auto flex-1'>
          {loading ? (
            <div className='flex items-center justify-center py-14'>
              <div className='h-7 w-7 animate-spin rounded-full border-2 border-[#eee0d2] border-t-[#E8921A]' />
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-14 px-4'>
              <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100'>
                <HiInformationCircle className='h-7 w-7 text-gray-400' />
              </div>
              <p className='font-semibold text-gray-700 text-sm'>Aucune notification</p>
              <p className='mt-1 text-xs text-gray-400'>Vous êtes à jour !</p>
            </div>
          ) : (
            <div className='flex flex-col gap-0'>
              {notifications.map((notification, index) => {
                const styles = getTypeStyles(notification.type, notification.read);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group relative flex cursor-pointer gap-3 px-4 py-3 transition-colors duration-150
                      ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-white hover:bg-gray-50'}
                      ${index !== 0 ? 'border-t border-t-[#f0ebe4]' : ''}
                    `}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Body */}
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-2'>
                        <p className={`text-sm leading-snug ${notification.read ? 'font-medium text-gray-500' : 'font-black text-gray-950'}`}>
                          {notification.title}
                        </p>
                        {/* Unread dot */}
                        {!notification.read && (
                          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
                        )}
                      </div>

                      <p className={`mt-0.5 text-xs leading-relaxed ${notification.read ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>

                      <p className='mt-1.5 text-[11px] font-semibold text-gray-400'>
                        {formatDate(notification.created_at)}
                      </p>
                    </div>

                    {/* Actions — visible on hover */}
                    <div className='absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                      {!notification.read && (
                        <button
                          onClick={e => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                          title='Marquer comme lu'
                          className='flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition hover:bg-emerald-50 hover:ring-emerald-300'
                        >
                          <HiCheck className='h-3.5 w-3.5 text-gray-400 hover:text-emerald-600' />
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(notification.id); }}
                        title='Supprimer'
                        className='flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition hover:bg-red-50 hover:ring-red-300'
                      >
                        <HiX className='h-3.5 w-3.5 text-gray-400 hover:text-red-500' />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t border-[#eee0d2] bg-white p-3'>
          <button
            type='button'
            onClick={() => { onClose(); navigate('/notifications'); }}
            className='w-full rounded-xl bg-[#fff8f4] px-4 py-2.5 text-sm font-black text-[#E8921A] transition hover:bg-orange-100'
          >
            Voir toutes les notifications
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
