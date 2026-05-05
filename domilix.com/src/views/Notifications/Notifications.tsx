'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiCheck,
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiTrash,
  HiXCircle,
} from 'react-icons/hi';

import Footer2 from '@components/Footer2/Footer2';
import Nav2 from '@components/Nav2/Nav2';
import { notificationApi, type Notification } from '@services/notificationApi';
import { useAuthStore } from '@stores/defineStore';

export default function Notifications() {
  const router = useRouter();
  const authData = useAuthStore(state => state.authData);
  const authChecked = useAuthStore(state => state.authChecked);
  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated || !authChecked) return;
    if (authData.status !== 'logged') {
      router.replace('/401');
      return;
    }

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationApi.getNotifications(false, 1, 100);
        setNotifications(data);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [authChecked, authData.status, hasHydrated, router]);

  const markAsRead = async (id: number) => {
    await notificationApi.markAsRead(id);
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));
  };

  const markAllAsRead = async () => {
    await notificationApi.markAllAsRead();
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  const deleteNotification = async (id: number) => {
    await notificationApi.deleteNotification(id);
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className='h-6 w-6 text-green-500' />;
      case 'error':
        return <HiXCircle className='h-6 w-6 text-red-500' />;
      case 'warning':
        return <HiExclamationCircle className='h-6 w-6 text-orange-500' />;
      default:
        return <HiInformationCircle className='h-6 w-6 text-blue-500' />;
    }
  };

  if (!hasHydrated || !authChecked || authData.status !== 'logged') {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-20'>
      <Nav2 />
      <main className='mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.24em] text-orange-500'>
              Centre de notifications
            </p>
            <h1 className='mt-2 text-4xl font-black text-gray-950'>Notifications</h1>
            <p className='mt-2 text-gray-600'>Toutes vos alertes Domilix au même endroit.</p>
          </div>
          {notifications.some(item => !item.read) && (
            <button
              type='button'
              onClick={markAllAsRead}
              className='rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600'
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <section className='overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm'>
          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='h-9 w-9 animate-spin rounded-full border-b-2 border-orange-600' />
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center px-4 py-20 text-center'>
              <HiInformationCircle className='mb-4 h-14 w-14 text-gray-300' />
              <h2 className='text-lg font-bold text-gray-900'>Aucune notification</h2>
              <p className='mt-2 text-sm text-gray-500'>Vous n'avez rien reçu pour le moment.</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {notifications.map(notification => (
                <article
                  key={notification.id}
                  className={`p-5 transition ${notification.read ? 'bg-white' : 'bg-orange-50/55'}`}
                >
                  <div className='flex gap-4'>
                    <div className='mt-1'>{getIcon(notification.type)}</div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                        <div>
                          <h2 className={`font-bold ${notification.read ? 'text-gray-700' : 'text-gray-950'}`}>
                            {notification.title}
                          </h2>
                          <p className='mt-1 text-sm leading-6 text-gray-600'>{notification.message}</p>
                          <p className='mt-3 text-xs font-medium text-gray-400'>
                            {new Date(notification.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <div className='flex shrink-0 gap-2'>
                          {notification.link && (
                            <button
                              type='button'
                              onClick={() => router.push(notification.link!)}
                              className='rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
                            >
                              Ouvrir
                            </button>
                          )}
                          {!notification.read && (
                            <button
                              type='button'
                              onClick={() => markAsRead(notification.id)}
                              className='rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600'
                              title='Marquer comme lu'
                            >
                              <HiCheck className='h-4 w-4' />
                            </button>
                          )}
                          <button
                            type='button'
                            onClick={() => deleteNotification(notification.id)}
                            className='rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                            title='Supprimer'
                          >
                            <HiTrash className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer2 />
    </div>
  );
}
